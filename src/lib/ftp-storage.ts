import type SftpClient from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';
import os from 'os';
import sharp from 'sharp';

function getSftpClient(): SftpClient {
  const SftpConstructor = (eval('require')('ssh2-sftp-client')) as typeof SftpClient;
  return new SftpConstructor();
}

export type UploadUseCase =
  | 'leader_profile'
  | 'member_profile'
  | 'event_banner'
  | 'sponsor_logo'
  | 'media_gallery'
  | 'general';

/**
 * Usecase directory mapping:
 * e.g. leader_profile -> leaders/profiles/<name>_<timestamp>.<ext>
 */
export const UPLOAD_PATH_MAP: Record<
  UploadUseCase,
  {
    subDir: string;
    generateFilename: (name: string, ext: string) => string;
  }
> = {
  leader_profile: {
    subDir: 'leaders/profiles',
    generateFilename: (name, ext) => {
      const sanitized = sanitizeSlug(name || 'leader');
      const shortTs = Date.now().toString(36); // e.g. "l5xyz"
      return `${sanitized}_${shortTs}${ext}`;
    },
  },
  member_profile: {
    subDir: 'members/profiles',
    generateFilename: (name, ext) => {
      const sanitized = sanitizeSlug(name || 'member');
      const shortTs = Date.now().toString(36);
      return `${sanitized}_${shortTs}${ext}`;
    },
  },
  event_banner: {
    subDir: 'events/banners',
    generateFilename: (name, ext) => {
      const sanitized = sanitizeSlug(name || 'event');
      const shortTs = Date.now().toString(36);
      return `${sanitized}_${shortTs}${ext}`;
    },
  },
  sponsor_logo: {
    subDir: 'sponsors/logos',
    generateFilename: (name, ext) => {
      const sanitized = sanitizeSlug(name || 'sponsor');
      const shortTs = Date.now().toString(36);
      return `${sanitized}_${shortTs}${ext}`;
    },
  },
  media_gallery: {
    subDir: 'media/gallery',
    generateFilename: (name, ext) => {
      const sanitized = sanitizeSlug(name || 'media');
      const shortTs = Date.now().toString(36);
      return `${sanitized}_${shortTs}${ext}`;
    },
  },
  general: {
    subDir: 'uploads/general',
    generateFilename: (name, ext) => {
      const sanitized = sanitizeSlug(name || 'file');
      const shortTs = Date.now().toString(36);
      return `${sanitized}_${shortTs}${ext}`;
    },
  },
};

function sanitizeSlug(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'upload'
  );
}

export interface UploadResult {
  success: boolean;
  url: string;
  thumbnailUrl?: string;
  thumbnailFilename?: string;
  relativePath: string;
  filename: string;
  storageType: 'ftp' | 'sftp';
  error?: string;
}

/**
 * Loads the SSH private key from environment or local path:
 * 1. SFTP_PRIVATE_KEY_BASE64 or FTP_PRIVATE_KEY_BASE64 (base64 string)
 * 2. SFTP_PRIVATE_KEY or FTP_PRIVATE_KEY (raw PEM string, handles \n)
 * 3. SFTP_KEY_PATH or FTP_KEY_PATH (file path, supports ~/)
 * 4. Fallback ~/.ssh/siteground_key (standard SiteGround local key)
 */
function loadPrivateKey(): Buffer | null {
  // 1. Base64 encoded private key
  const b64 = (process.env.SFTP_PRIVATE_KEY_BASE64 || process.env.FTP_PRIVATE_KEY_BASE64)
    ?.trim()
    .replace(/^["']|["']$/g, '');
  if (b64) {
    try {
      return Buffer.from(b64, 'base64');
    } catch (e) {
      console.error('[SFTP] Failed to parse base64 private key:', e);
    }
  }

  // 2. Raw PEM private key string
  const rawKey = (process.env.SFTP_PRIVATE_KEY || process.env.FTP_PRIVATE_KEY)
    ?.trim()
    .replace(/^["']|["']$/g, '');
  if (rawKey && rawKey.includes('PRIVATE KEY')) {
    return Buffer.from(rawKey.replace(/\\n/g, '\n'), 'utf8');
  }

  // 3. Specified file path (expands ~/)
  const keyPath = (process.env.SFTP_KEY_PATH || process.env.FTP_KEY_PATH)?.trim();
  if (keyPath) {
    const resolvedPath = keyPath.startsWith('~/')
      ? path.join(os.homedir(), keyPath.slice(2))
      : path.resolve(keyPath);
    if (fs.existsSync(resolvedPath)) {
      return fs.readFileSync(resolvedPath);
    }
  }

  // 4. Default local development SiteGround SSH key
  const defaultLocalKey = path.join(os.homedir(), '.ssh', 'siteground_key');
  if (fs.existsSync(defaultLocalKey)) {
    return fs.readFileSync(defaultLocalKey);
  }

  return null;
}

function failure(error: string): UploadResult {
  return {
    success: false,
    url: '',
    relativePath: '',
    filename: '',
    storageType: 'sftp',
    error,
  };
}

/**
 * Uploads a buffer via SFTP (SSH key or password auth) — SiteGround uses port 18765.
 */
export async function uploadFileViaSFTP(
  fileBuffer: Buffer,
  originalFilename: string,
  useCase: UploadUseCase = 'general',
  identifierName: string = 'file'
): Promise<UploadResult> {
  const ext = path.extname(originalFilename).toLowerCase() || '.jpg';
  const config = UPLOAD_PATH_MAP[useCase] || UPLOAD_PATH_MAP.general;
  const filename = config.generateFilename(identifierName, ext);
  const relativePath = `${config.subDir}/${filename}`;

  // Seamless fallback between SFTP_* and FTP_* environment variables
  const host = process.env.SFTP_HOST?.trim() || process.env.FTP_HOST?.trim();
  const username = process.env.SFTP_USER?.trim() || process.env.FTP_USER?.trim();
  const port = parseInt(process.env.SFTP_PORT || process.env.FTP_PORT || '18765', 10);
  const password = process.env.SFTP_PASSWORD?.trim() || process.env.FTP_PASSWORD?.trim();
  const passphrase = process.env.SFTP_PASSPHRASE || process.env.FTP_PASSPHRASE || password || undefined;
  const baseUrl = (process.env.SFTP_BASE_URL?.trim() || process.env.FTP_BASE_URL?.trim() || 'https://media.mitrauk.com/media').replace(/\/+$/, '');
  const remoteRootDir = (process.env.SFTP_ROOT_DIR?.trim() || process.env.FTP_ROOT_DIR?.trim() || 'www/media.mitrauk.com/public_html/media').replace(/\/+$/, '');
  const timeoutMs = parseInt(process.env.SFTP_TIMEOUT || process.env.FTP_TIMEOUT || '60000', 10);

  const privateKey = loadPrivateKey();

  if (!host || !username) {
    return failure(
      'SFTP config missing: set SFTP_HOST (or FTP_HOST) and SFTP_USER (or FTP_USER) in environment.'
    );
  }

  if (!privateKey && !password) {
    return failure(
      'SFTP authentication missing: set SFTP_PRIVATE_KEY_BASE64, SFTP_KEY_PATH, or SFTP_PASSWORD.'
    );
  }

  const sftp = getSftpClient();

  try {
    const connectConfig: SftpClient.ConnectOptions = {
      host,
      port,
      username,
      readyTimeout: timeoutMs,
    };

    if (privateKey) {
      connectConfig.privateKey = privateKey;
      if (passphrase) {
        connectConfig.passphrase = passphrase;
      }
    } else if (password) {
      connectConfig.password = password;
    }

    await sftp.connect(connectConfig);

    // Target remote directory: e.g. www/media.mitrauk.com/public_html/media/media/gallery
    const targetRemoteDir = [remoteRootDir, config.subDir].filter(Boolean).join('/').replace(/\/+/g, '/');

    const dirExists = await sftp.exists(targetRemoteDir);
    if (!dirExists) {
      await sftp.mkdir(targetRemoteDir, true); // recursive directory creation
    }

    // Check if uploaded file is an image
    const isImage = /\.(jpe?g|png|webp|gif|avif)$/i.test(ext);
    let thumbFilename: string | undefined = undefined;
    let thumbnailUrl: string | undefined = undefined;

    // 1. Upload original file (full resolution for download)
    await sftp.put(fileBuffer, `${targetRemoteDir}/${filename}`);
    const publicUrl = `${baseUrl}/${config.subDir}/${filename}`.replace(/([^:]\/)\/+/g, '$1');

    // 2. Generate and upload lightweight WebP thumbnail directly to file storage
    if (isImage) {
      try {
        const baseWithoutExt = filename.replace(/\.[^.]+$/, '');
        thumbFilename = `${baseWithoutExt}_thumb.webp`;

        const thumbBuffer = await sharp(fileBuffer)
          .rotate() // preserve EXIF orientation
          .resize({
            width: 400,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 75 })
          .toBuffer();

        await sftp.put(thumbBuffer, `${targetRemoteDir}/${thumbFilename}`);
        thumbnailUrl = `${baseUrl}/${config.subDir}/${thumbFilename}`.replace(/([^:]\/)\/+/g, '$1');
      } catch (sharpErr) {
        console.warn('[SFTP THUMBNAIL WARNING]: Could not generate WebP thumbnail:', sharpErr);
      }
    }

    return {
      success: true,
      url: publicUrl,
      thumbnailUrl: thumbnailUrl || publicUrl,
      thumbnailFilename,
      relativePath,
      filename,
      storageType: 'sftp',
    };
  } catch (err: any) {
    console.error('[SFTP UPLOAD ERROR]:', err);
    return failure(`SFTP upload failed: ${err?.message || 'Connection or permission error'}`);
  } finally {
    await sftp.end().catch(() => {});
  }
}

/**
 * Backwards-compatible alias so existing imports of uploadFileViaFTP keep working seamlessly.
 */
export const uploadFileViaFTP = uploadFileViaSFTP;
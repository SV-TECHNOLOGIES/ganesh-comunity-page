import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ukta-secret-fallback-key-2026';
const SALT_ROUNDS = 10;

// ── Password utilities ──────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── JWT utilities ───────────────────────────────────────────────────────────

export interface TokenPayload {
  id: string;
  email: string;
  role: 'Member' | 'Admin';
  tier?: string;
  fullName?: string;
}

export function signToken(payload: TokenPayload, expiresIn = '30d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

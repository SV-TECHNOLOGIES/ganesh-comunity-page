import { prisma } from '@/lib/prisma';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILURE' | 'DEBUG';

export interface LogMeta {
  ip?: string;
  userId?: string;
}

const RETENTION_DAYS = 7;
let lastPruneTime = 0;
const PRUNE_INTERVAL_MS = 10 * 60 * 1000; // Run pruning at most once every 10 minutes

/**
 * Prunes logs older than the retention period (default: 7 days)
 */
export async function pruneOldLogs(retentionDays: number = RETENTION_DAYS): Promise<{ deletedCount: number }> {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const result = await prisma.systemLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    if (result.count > 0) {
      console.log(`[LOGGER RETENTION] Cleaned up ${result.count} logs older than ${retentionDays} days (before ${cutoffDate.toISOString()})`);
    }
    return { deletedCount: result.count };
  } catch (error) {
    console.error('[LOGGER RETENTION] Failed to prune old logs:', error);
    return { deletedCount: 0 };
  }
}

/**
 * Background auto-pruning check (throttled)
 */
function triggerAutoPruning() {
  const now = Date.now();
  if (now - lastPruneTime > PRUNE_INTERVAL_MS) {
    lastPruneTime = now;
    // Execute asynchronously in background without blocking current call
    pruneOldLogs().catch(() => {});
  }
}

/**
 * Safe JSON sanitizer for metadata and errors
 */
function sanitizeDetails(details: any): any {
  if (details === undefined || details === null) {
    return null;
  }

  if (details instanceof Error) {
    return {
      name: details.name,
      message: details.message,
      stack: details.stack,
    };
  }

  if (typeof details === 'object') {
    try {
      // Handles circular references and transforms Error objects within
      return JSON.parse(
        JSON.stringify(details, (_key, value) => {
          if (value instanceof Error) {
            return {
              name: value.name,
              message: value.message,
              stack: value.stack,
            };
          }
          return value;
        })
      );
    } catch {
      return { raw: String(details) };
    }
  }

  return { value: details };
}

/**
 * Core logging function that outputs to console and saves to Database SystemLog
 */
export async function logToDb(
  level: LogLevel,
  source: string,
  message: string,
  details?: any,
  meta?: LogMeta
) {
  const timestamp = new Date().toISOString();
  const safeDetails = sanitizeDetails(details);

  // 1. Console Output for developer observability
  const prefix = `[${level}] [${source}] [${timestamp}]`;
  if (level === 'ERROR' || level === 'PAYMENT_FAILURE') {
    console.error(`${prefix} ${message}`, safeDetails || '');
  } else if (level === 'WARN') {
    console.warn(`${prefix} ${message}`, safeDetails || '');
  } else {
    console.log(`${prefix} ${message}`, safeDetails || '');
  }

  // 2. Trigger non-blocking auto-pruning for 7-day retention
  triggerAutoPruning();

  // 3. Persist to PostgreSQL SystemLog table
  try {
    const record = await prisma.systemLog.create({
      data: {
        level,
        source,
        message,
        details: safeDetails,
        ip: meta?.ip || null,
        userId: meta?.userId || null,
      },
    });
    return record;
  } catch (dbError) {
    // If DB is temporarily unavailable, never crash the host application
    console.error(`[LOGGER DB FAILURE] Could not write log to database:`, dbError);
    return null;
  }
}

export const logger = {
  info: (source: string, message: string, details?: any, meta?: LogMeta) =>
    logToDb('INFO', source, message, details, meta),

  warn: (source: string, message: string, details?: any, meta?: LogMeta) =>
    logToDb('WARN', source, message, details, meta),

  error: (source: string, message: string, errorOrDetails?: any, meta?: LogMeta) =>
    logToDb('ERROR', source, message, errorOrDetails, meta),

  paymentSuccess: (source: string, message: string, details: any, meta?: LogMeta) =>
    logToDb('PAYMENT_SUCCESS', source, message, details, meta),

  paymentFailure: (source: string, message: string, details: any, meta?: LogMeta) =>
    logToDb('PAYMENT_FAILURE', source, message, details, meta),

  debug: (source: string, message: string, details?: any, meta?: LogMeta) =>
    logToDb('DEBUG', source, message, details, meta),
};

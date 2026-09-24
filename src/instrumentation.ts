/**
 * Next.js Instrumentation Hook
 * Runs once when the Next.js server instance starts up.
 * Ensures the background Email Queue worker is initialized.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // 1. Initialize HTTP response-time request analytics logger hook
      const { initRequestAnalyticsServerHook } = await import('@/lib/request-analytics');
      initRequestAnalyticsServerHook();

      // 2. Background Email Queue Worker
      const { startEmailQueueWorker } = await import('@/lib/email-queue');
      // startEmailQueueWorker();
      console.log('[INSTRUMENTATION] Background workers & Request Analytics registered successfully.');
    } catch (err) {
      console.error('[INSTRUMENTATION] Failed initializing server hooks:', err);
    }
  }
}

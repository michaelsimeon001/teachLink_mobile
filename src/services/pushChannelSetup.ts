/**
 * Android notification channel setup with retry and visible failure. (#785)
 *
 * Channel creation was wrapped in a bare try/catch that swallowed the error,
 * so Android notifications silently never appeared and nothing in the logs
 * said why. This retries once — channel creation fails transiently during
 * cold start — and reports the failure instead of continuing quietly.
 */

export interface ChannelSetupResult {
  ok: boolean;
  attempts: number;
  error?: Error;
}

type CreateChannel = () => Promise<void>;
type ReportFailure = (message: string, error: Error) => void;

const MAX_ATTEMPTS = 2;

/**
 * Runs `createChannel`, retrying once on failure.
 *
 * Never throws: startup should continue deliberately rather than crash, so the
 * outcome is returned and the failure is handed to `reportFailure` (Sentry in
 * production, a visible warning in dev).
 */
export async function setUpNotificationChannel(
  createChannel: CreateChannel,
  reportFailure: ReportFailure
): Promise<ChannelSetupResult> {
  let lastError = new Error('Notification channel setup did not run.');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await createChannel();
      return { ok: true, attempts: attempt };
    } catch (caught) {
      lastError = caught instanceof Error ? caught : new Error(String(caught));
    }
  }

  reportFailure(
    `Android notification channel setup failed after ${MAX_ATTEMPTS} attempts.`,
    lastError
  );
  return { ok: false, attempts: MAX_ATTEMPTS, error: lastError };
}

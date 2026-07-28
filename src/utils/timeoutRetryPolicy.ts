/**
 * Retry policy for timed-out requests. (#788)
 *
 * ECONNABORTED timeouts were logged and then dropped, so quiz submissions and
 * lesson completions vanished on slow networks. This decides which timed-out
 * requests belong in the offline queue: writes are replayed on reconnect,
 * reads are not — they are cheap to re-fetch and replaying them can resurface
 * stale data.
 */

const RETRYABLE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

export interface TimedOutRequest {
  method?: string;
  code?: string;
}

/** True when the failure is an axios client-side timeout. */
export function isTimeoutError(error: TimedOutRequest): boolean {
  return error.code === 'ECONNABORTED';
}

/**
 * True when a timed-out request should be queued for replay on reconnect.
 * Only non-idempotent writes qualify; GET/HEAD are re-fetched instead.
 */
export function shouldQueueForRetry(error: TimedOutRequest): boolean {
  if (!isTimeoutError(error)) return false;
  const method = error.method?.toLowerCase();
  return method !== undefined && RETRYABLE_METHODS.has(method);
}

/** Non-blocking confirmation shown once a request has been queued. */
export const QUEUED_ACTION_MESSAGE =
  "Saved — we'll finish this when you're back online.";

/**
 * Unknown-to-Error narrowing. (#796)
 *
 * Catch blocks typed `catch (error: unknown)` read `error.message` directly.
 * When a non-Error was thrown — a string from a native module, a plain
 * rejected object — that access threw a second time and masked the original
 * failure. Everything is normalised to a real Error here first.
 */

/** JSON.stringify that cannot itself throw on cyclic or exotic values. */
function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

/** Wraps any thrown value in a real Error, preserving the original as `cause`. */
export function toError(caught: unknown): Error {
  if (caught instanceof Error) return caught;
  if (typeof caught === 'string') return new Error(caught);

  if (caught && typeof caught === 'object' && 'message' in caught) {
    const { message } = caught as { message: unknown };
    if (typeof message === 'string') {
      const error = new Error(message);
      error.cause = caught;
      return error;
    }
  }

  const fallback = new Error(safeStringify(caught));
  fallback.cause = caught;
  return fallback;
}

/** Convenience for logging: the message of any thrown value. */
export function toErrorMessage(caught: unknown): string {
  return toError(caught).message;
}

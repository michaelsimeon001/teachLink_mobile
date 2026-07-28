/**
 * Error payload sanitisation before logging. (#792)
 *
 * Error response bodies were logged verbatim to console and Sentry. Backends
 * occasionally echo credentials and PII inside those bodies, which then
 * persist in log storage in plaintext. Sensitive keys are redacted here
 * before anything reaches a transport.
 */

const SENSITIVE_KEY_PATTERN = /(password|token|secret|card|cvv|ssn|authorization)/i;
const REDACTED = '[REDACTED]';
const MAX_DEPTH = 6;

/**
 * Returns a copy of `data` with sensitive values replaced by [REDACTED],
 * recursing through nested objects and arrays.
 *
 * Depth-capped so a deeply nested or self-referencing body cannot hang the
 * logger — beyond MAX_DEPTH the subtree is redacted wholesale.
 */
export function sanitizeErrorResponse(data: unknown, depth = 0): unknown {
  if (depth >= MAX_DEPTH) return REDACTED;
  if (Array.isArray(data)) return data.map((item) => sanitizeErrorResponse(item, depth + 1));
  if (!data || typeof data !== 'object') return data;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEY_PATTERN.test(key)
      ? REDACTED
      : sanitizeErrorResponse(value, depth + 1);
  }
  return result;
}

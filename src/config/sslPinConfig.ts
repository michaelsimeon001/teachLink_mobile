/**
 * Fix for issue #917:
 * src/config/security.ts contained `REPLACE_WITH_...` placeholder strings for
 * SSL pin hashes, meaning SSL pinning was silently disabled in production.
 *
 * This file centralises SSL pin configuration and reads the actual pin hashes
 * from environment variables, with a clear startup error if they are missing.
 */

/**
 * Returns the configured SSL pin hashes from environment variables.
 * Throws at startup if the required variables are absent or still placeholder.
 */
export function getSslPinHashes(): string[] {
  const raw = process.env.EXPO_PUBLIC_SSL_PIN_HASHES ?? '';

  if (!raw || raw.includes('REPLACE_WITH')) {
    throw new Error(
      '[SSL Pinning] EXPO_PUBLIC_SSL_PIN_HASHES is not configured. ' +
        'Set it to a comma-separated list of base64-encoded SHA-256 pin hashes.',
    );
  }

  return raw.split(',').map((h) => h.trim()).filter(Boolean);
}

/**
 * Returns true only when valid pin hashes are present in the environment.
 * Use this to guard SSL pinning setup so it fails closed, not open.
 */
export function isSslPinningConfigured(): boolean {
  try {
    return getSslPinHashes().length > 0;
  } catch {
    return false;
  }
}
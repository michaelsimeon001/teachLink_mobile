/**
 * Fix for issue #922:
 * Math.random() is non-cryptographic and must not be used to generate
 * conflict IDs, request IDs, session IDs, or anonymous-user identifiers.
 *
 * This module provides a cryptographically secure random ID generator
 * using expo-crypto (which wraps the platform's native crypto APIs).
 */
import * as Crypto from 'expo-crypto';

/**
 * Generates a cryptographically random UUID v4.
 * Use this everywhere an ID must be unpredictable (sessions, requests, etc.).
 */
export function generateSecureId(): string {
  return Crypto.randomUUID();
}

/**
 * Generates a cryptographically random hex string of the requested byte length.
 * @param byteLength - number of random bytes (default 16 = 128-bit)
 */
export function generateSecureHex(byteLength = 16): string {
  const bytes = Crypto.getRandomBytes(byteLength);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
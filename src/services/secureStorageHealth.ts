/**
 * Secure storage initialisation verification. (#789)
 *
 * Initialisation caught its own failures and still reported success, so the
 * app could boot with an unusable Keychain and fall back to storing tokens in
 * plaintext. A failed probe is fatal: the caller shows a recovery screen.
 */

export type StorageFailureStage = 'write' | 'read' | 'verify';

/** Fatal: the app must not continue with an untrustworthy secure store. */
export class SecureStorageUnavailableError extends Error {
  readonly code = 'SECURE_STORAGE_UNAVAILABLE';
  readonly stage: StorageFailureStage;
  readonly recoveryHint = 'Clear app data and restart. If it persists, reinstall.';
  constructor(stage: StorageFailureStage, cause?: unknown) {
    super(`Secure storage failed during ${stage} and cannot be trusted.`);
    this.name = 'SecureStorageUnavailableError';
    this.stage = stage;
    if (cause !== undefined) this.cause = cause;
  }
}
const PROBE_KEY = '__secure_storage_probe__';

export interface StorageProbe {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
}

/** Round-trips a probe value, throwing if it cannot be written and read back. */
export async function assertSecureStorageWorks(store: StorageProbe): Promise<void> {
  const expected = `probe-${Date.now()}`;
  let actual: string | null;

  try {
    await store.setItem(PROBE_KEY, expected);
  } catch (cause) {
    throw new SecureStorageUnavailableError('write', cause);
  }

  try {
    actual = await store.getItem(PROBE_KEY);
  } catch (cause) {
    throw new SecureStorageUnavailableError('read', cause);
  }

  await store.removeItem(PROBE_KEY).catch(() => undefined);
  if (actual !== expected) throw new SecureStorageUnavailableError('verify');
}

/**
 * Structured auth initialisation error. (#790)
 *
 * Auth operations threw a bare "not initialized" Error, so a caller could not
 * tell which dependency was missing — secure storage, the API client, the
 * signing secret — nor react to it programmatically. This names the
 * dependency and is `instanceof`-checkable.
 */

export type AuthDependency = 'secureStore' | 'apiClient' | 'jwtSecret' | 'sessionCache';

const DEPENDENCY_LABELS: Record<AuthDependency, string> = {
  secureStore: 'secure storage (Keychain/Keystore)',
  apiClient: 'the API client',
  jwtSecret: 'the JWT signing secret',
  sessionCache: 'the session cache',
};

/** Thrown when an auth operation runs before its dependencies are ready. */
export class AuthInitializationError extends Error {
  readonly code = 'AUTH_NOT_INITIALIZED';
  readonly missingDependency: AuthDependency;

  constructor(missingDependency: AuthDependency) {
    super(
      `Authentication is unavailable: ${DEPENDENCY_LABELS[missingDependency]} is not initialized.`
    );
    this.name = 'AuthInitializationError';
    this.missingDependency = missingDependency;
  }
}

/** Narrowing guard for callers that need the missing dependency name. */
export function isAuthInitializationError(error: unknown): error is AuthInitializationError {
  return error instanceof AuthInitializationError;
}

/** Guard clause helper: throws AuthInitializationError when `ready` is false. */
export function assertAuthDependency(ready: boolean, dependency: AuthDependency): void {
  if (!ready) throw new AuthInitializationError(dependency);
}

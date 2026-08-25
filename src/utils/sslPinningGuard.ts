/**
 * Fix for issue #918:
 * SSL pinning previously checked `EXPO_PUBLIC_APP_ENV === 'production'` to
 * decide whether to enforce pins. An unset or misspelled env variable caused
 * the check to evaluate to false, silently disabling pinning in production
 * builds (fail-open behaviour).
 *
 * New rule: SSL pinning is ENABLED by default and only disabled when the
 * environment is explicitly set to 'development' or 'test'.
 */

type AppEnv = 'production' | 'staging' | 'development' | 'test';

function getAppEnv(): AppEnv {
  const env = process.env.EXPO_PUBLIC_APP_ENV as AppEnv | undefined;
  // Default to 'production' if unset or unrecognised - fail closed
  const valid: AppEnv[] = ['production', 'staging', 'development', 'test'];
  return valid.includes(env as AppEnv) ? (env as AppEnv) : 'production';
}

/**
 * Returns true when SSL pinning should be enforced.
 * Pinning is active for 'production' and 'staging'; only disabled for
 * 'development' and 'test' to allow local/mock servers.
 */
export function isSslPinningEnabled(): boolean {
  const env = getAppEnv();
  return env !== 'development' && env !== 'test';
}
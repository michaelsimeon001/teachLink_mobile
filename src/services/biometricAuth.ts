/**
 * Fix for issue #920:
 * `expo-local-authentication` was loaded via a bare `require()` at call time
 * inside a silent try/catch that defaulted to "enrolled" on any error.
 * This meant a missing or failed native module was silently treated as if
 * biometrics were available, bypassing the authentication gate.
 *
 * This wrapper imports the module at the top level and exposes a safe checker
 * that returns `false` (not enrolled) when the module is unavailable.
 */
import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Returns true only if the device has enrolled biometrics AND the module
 * loaded successfully. Never defaults to true on error.
 */
export async function isBiometricEnrolled(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;
    return await LocalAuthentication.isEnrolledAsync();
  } catch {
    // Module unavailable or native error - treat as NOT enrolled
    return false;
  }
}

/**
 * Authenticates the user with biometrics.
 * Returns the full AuthenticateResult so the caller can inspect success/error.
 */
export async function authenticateWithBiometrics(
  promptMessage: string,
): Promise<LocalAuthentication.LocalAuthenticationResult> {
  return LocalAuthentication.authenticateAsync({ promptMessage });
}
/**
 * Typed biometric availability reporting. (#784)
 *
 * Biometric login surfaced every failure as the same generic "not available"
 * Error, so callers could not tell unsupported hardware from an unenrolled
 * device and always showed the same dead-end message. These helpers classify
 * the blocking reason and carry it on a typed, `instanceof`-checkable error.
 * The caller passes in probe results, keeping this testable without natives.
 */

export type BiometricUnavailableReason =
  | 'noHardware'
  | 'notEnrolled'
  | 'notEnabled'
  | 'unknown';

const REASON_MESSAGES: Record<BiometricUnavailableReason, string> = {
  noHardware: 'This device has no biometric sensor.',
  notEnrolled: 'No fingerprint or face is enrolled. Add one in device settings.',
  notEnabled: 'Biometric login is off. Turn it on in app settings.',
  unknown: 'Biometric authentication is unavailable on this device.',
};

/** Error carrying the specific reason biometric login could not run. */
export class BiometricUnavailableError extends Error {
  readonly code = 'BIOMETRIC_UNAVAILABLE';
  readonly reason: BiometricUnavailableReason;

  constructor(reason: BiometricUnavailableReason) {
    super(REASON_MESSAGES[reason]);
    this.name = 'BiometricUnavailableError';
    this.reason = reason;
  }
}

export interface BiometricProbe {
  hasHardware: boolean;
  isEnrolled: boolean;
  isEnabledInApp: boolean;
}

/** Returns the blocking reason, or null when biometric login may proceed. */
export function getBiometricUnavailableReason(
  probe: BiometricProbe
): BiometricUnavailableReason | null {
  if (!probe.hasHardware) return 'noHardware';
  if (!probe.isEnrolled) return 'notEnrolled';
  if (!probe.isEnabledInApp) return 'notEnabled';
  return null;
}

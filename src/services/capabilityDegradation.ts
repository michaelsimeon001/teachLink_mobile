/**
 * Capability failure to feature degradation. (#797)
 *
 * Failed capability checks were logged but never reached the degradation
 * store, so features that should have been switched off stayed enabled and
 * failed later at the point of use. This applies the disable calls and
 * reports what was degraded so the UI can show an indicator.
 */
import { FeatureStatus, FeatureType } from './featureCapabilities';

const USABLE_STATUSES: ReadonlySet<FeatureStatus> = new Set([
  FeatureStatus.AVAILABLE,
  FeatureStatus.DEGRADED,
]);

export interface CapabilityCheck {
  feature: FeatureType;
  status: FeatureStatus;
}

/** True when the feature cannot be used and must be degraded. */
export function isCapabilityUnusable(check: CapabilityCheck): boolean {
  return !USABLE_STATUSES.has(check.status);
}

/** Human-readable reason recorded alongside the disable call. */
export function describeCapabilityFailure(check: CapabilityCheck): string {
  return `Capability check failed for ${check.feature} (${check.status}).`;
}

/**
 * Disables every feature whose capability check failed, returning the
 * features that were degraded.
 */
export function applyCapabilityDegradation(
  checks: readonly CapabilityCheck[],
  disableFeature: (feature: FeatureType, reason?: string) => void
): FeatureType[] {
  const degraded: FeatureType[] = [];

  for (const check of checks) {
    if (!isCapabilityUnusable(check)) continue;
    disableFeature(check.feature, describeCapabilityFailure(check));
    degraded.push(check.feature);
  }

  return degraded;
}

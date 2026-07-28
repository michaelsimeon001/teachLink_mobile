/**
 * Async effect with captured rejection state. (#795)
 *
 * Form fields ran their cache load as `void loadCache()` inside useEffect,
 * which discards the rejection — a failed read left the field looking healthy
 * with the error recorded nowhere. This keeps the rejection as state, reports
 * it, and skips updates after unmount.
 */
import { DependencyList, useEffect, useState } from 'react';

export interface AsyncEffectState {
  /** Rejection from the most recent run, or null when it succeeded. */
  error: Error | null;
  /** True while the effect is in flight. */
  loading: boolean;
}
/**
 * Runs `effect` on mount and whenever `deps` change, surfacing its failure
 * instead of discarding it. `onError` receives the Error for reporting.
 */
export function useAsyncEffectState(
  effect: () => Promise<void>,
  deps: DependencyList,
  onError?: (error: Error) => void
): AsyncEffectState {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    effect()
      .then(() => {
        if (active) setError(null);
      })
      .catch((caught: unknown) => {
        const failure = caught instanceof Error ? caught : new Error(String(caught));
        onError?.(failure);
        if (active) setError(failure);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { error, loading };
}

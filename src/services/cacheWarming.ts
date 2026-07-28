import * as Network from 'expo-network';
import { useAppStore } from '../store';
import { appLogger } from '../utils/logger';
import { courseApi } from './api/courseApi';
import { userApi } from './api/userApi';

/**
 * Warm critical caches in parallel during the splash screen so home screen
 * data is ready before the user sees it.
 *
 * #814: Network-quality aware — skips or reduces prefetch on slow connections
 * to prevent startup latency on 2G/3G and avoid exhausting mobile data budgets.
 *
 * Connection tiers:
 *   Offline      → skip entirely
 *   Cellular     → minimal prefetch (courses only, no user profile)
 *   WiFi / Other → full prefetch (courses + user profile)
 */
export async function warmCriticalCaches(): Promise<void> {
  const start = Date.now();

  // ── Network quality gate ────────────────────────────────────────────────────
  let networkState: Network.NetworkState;
  try {
    networkState = await Network.getNetworkStateAsync();
  } catch {
    // If we cannot determine network state, proceed with a minimal fetch
    // to avoid blocking startup on a permissions/API error.
    appLogger.warnSync('[CacheWarming] Could not determine network state — minimal prefetch');
    await courseApi.getCourses().catch(() => null);
    return;
  }

  if (!networkState.isConnected || !networkState.isInternetReachable) {
    appLogger.infoSync('[CacheWarming] Skipped — device is offline');
    return;
  }

  const type = networkState.type;
  // WiFi and OTHER (Ethernet/VPN) are considered fast; cellular types are slow.
  const isFastNetwork =
    type === Network.NetworkStateType.WIFI || type === Network.NetworkStateType.OTHER;

  if (!isFastNetwork) {
    // On cellular or unknown connections: prefetch only the most critical data
    // (course list) and skip optional resources to conserve data.
    appLogger.infoSync(
      `[CacheWarming] Slow connection (${type}) — minimal prefetch (courses only)`
    );
    await courseApi.getCourses().catch(() => null);
    appLogger.infoSync(`[CacheWarming] Minimal prefetch completed in ${Date.now() - start}ms`);
    return;
  }

  // ── Full prefetch on fast connections ───────────────────────────────────────
  const userId = useAppStore.getState().user?.id;

  const tasks: Promise<unknown>[] = [
    courseApi.getCourses().catch(() => null),
  ];

  if (userId) {
    tasks.push(userApi.getUser(userId).catch(() => null));
  }

  await Promise.all(tasks);

  appLogger.infoSync(`[CacheWarming] Full prefetch completed in ${Date.now() - start}ms`);
}

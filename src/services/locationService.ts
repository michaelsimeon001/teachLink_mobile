/**
 * Location Service with Graceful Degradation
 *
 * Attempts to get user location via multiple methods:
 * 1. Device GPS (geolocation API)
 * 2. User-entered text location
 * 3. Cached/previously saved location
 *
 * Gracefully degrades to manual entry if GPS unavailable
 * No errors thrown - always falls back to manual entry
 *
 * Security (#591): the service also monitors for OS-level location permission
 * revocation. When a user turns off location access from Settings while the app
 * is running, the active position watcher is stopped, cached/stored coordinates
 * are cleared, and permission state is flipped to false so no stale location
 * data is ever served.
 */

import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';

import { featureCapabilities, FeatureStatus, FeatureType } from './featureCapabilities';
import { useDegradationStore } from '../store/degradationStore';
import { useLocationStore } from '../store/locationStore';
import { appLogger } from '../utils/logger';

/**
 * How often (ms) to re-check OS permission while a watcher is active. Combined
 * with the AppState 'active' listener this guarantees revocation is detected
 * within a few seconds even if the app is never backgrounded.
 */
const PERMISSION_POLL_INTERVAL_MS = 3000;

export enum LocationSourceType {
  GPS = 'gps',
  MANUAL = 'manual',
  CACHED = 'cached',
  UNAVAILABLE = 'unavailable',
}

export interface LocationData {
  latitude?: number;
  longitude?: number;
  address?: string; // User-entered or reverse geocoded
  accuracy?: number;
  source: LocationSourceType;
  obtainedAt: string; // ISO timestamp
}

class LocationService {
  private static instance: LocationService;
  private cachedLocation: LocationData | null = null;
  private locationPermissionStatus: Location.PermissionStatus | null = null;

  // #591 — position watcher + permission-revoke monitoring
  private watchSubscription: Location.LocationSubscription | null = null;
  private appStateSubscription: { remove: () => void } | null = null;
  private permissionPollTimer: ReturnType<typeof setInterval> | null = null;
  private lastPermissionGranted = false;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permission
   */
  public async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.locationPermissionStatus = status;

      if (status === 'granted') {
        featureCapabilities.getFeatureInfo(FeatureType.LOCATION);
        const degradationStore = useDegradationStore();
        degradationStore.setFeatureStatus(FeatureType.LOCATION, FeatureStatus.AVAILABLE);
        appLogger.infoSync('[LocationService] Location permission granted');
        return true;
      } else {
        featureCapabilities.getFeatureInfo(FeatureType.LOCATION);
        const degradationStore = useDegradationStore();
        degradationStore.setFeatureStatus(FeatureType.LOCATION, FeatureStatus.DEGRADED);
        degradationStore.addNotification({
          feature: FeatureType.LOCATION,
          status: FeatureStatus.DEGRADED,
          message: 'Location permission denied. You can manually enter your location instead.',
        });
        appLogger.infoSync('[LocationService] Location permission denied');
        return false;
      }
    } catch (error) {
      appLogger.errorSync('[LocationService] Error requesting permission', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Check current location permission status
   */
  public async checkPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      this.locationPermissionStatus = status;
      return status === 'granted';
    } catch (error) {
      appLogger.errorSync('[LocationService] Error checking permission', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Get current location via GPS
   * Returns null if GPS unavailable - app should fall back to manual entry
   */
  public async getCurrentLocation(): Promise<LocationData | null> {
    try {
      // Check permission
      const hasPermission = this.locationPermissionStatus === 'granted' || (await this.checkPermission());
      if (!hasPermission) {
        appLogger.infoSync('[LocationService] Location permission not granted - GPS unavailable');
        featureCapabilities.getFeatureInfo(FeatureType.LOCATION);
        const degradationStore = useDegradationStore();
        degradationStore.setFeatureStatus(FeatureType.LOCATION, FeatureStatus.DEGRADED);
        return null;
      }

      // Try to get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 0,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        source: LocationSourceType.GPS,
        obtainedAt: new Date().toISOString(),
      };

      // Try to reverse geocode to get address
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (addresses.length > 0) {
          const address = addresses[0];
          const parts = [address.city, address.region, address.country].filter(Boolean);
          locationData.address = parts.join(', ');
        }
      } catch (geocodeError) {
        appLogger.infoSync('[LocationService] Reverse geocoding failed (non-fatal)', geocodeError instanceof Error ? geocodeError : new Error(String(geocodeError)));
        // Continue with GPS coordinates even if geocoding fails
      }

      // Cache the location
      this.cachedLocation = locationData;

      // Update feature status
      featureCapabilities.getFeatureInfo(FeatureType.LOCATION);
      const degradationStore = useDegradationStore();
      degradationStore.setFeatureStatus(FeatureType.LOCATION, FeatureStatus.AVAILABLE);

      appLogger.infoSync('[LocationService] GPS location obtained successfully', {
        lat: locationData.latitude,
        lon: locationData.longitude,
      });

      return locationData;
    } catch (error) {
      appLogger.errorSync('[LocationService] Error getting current location', error instanceof Error ? error : new Error(String(error)));

      // Feature degraded but not unavailable - return cached location if available
      featureCapabilities.getFeatureInfo(FeatureType.LOCATION);
      const degradationStore = useDegradationStore();
      degradationStore.setFeatureStatus(FeatureType.LOCATION, FeatureStatus.DEGRADED);
      degradationStore.addNotification({
        feature: FeatureType.LOCATION,
        status: FeatureStatus.DEGRADED,
        message: 'Could not access your current location. Please enter your location manually.',
      });

      return null;
    }
  }

  /**
   * Validate and store a manually entered location
   */
  public setManualLocation(address: string): LocationData {
    const locationData: LocationData = {
      address: address.trim(),
      source: LocationSourceType.MANUAL,
      obtainedAt: new Date().toISOString(),
    };

    this.cachedLocation = locationData;

    featureCapabilities.getFeatureInfo(FeatureType.LOCATION);
    const degradationStore = useDegradationStore();
    degradationStore.setFeatureStatus(FeatureType.LOCATION, FeatureStatus.AVAILABLE);

    appLogger.infoSync('[LocationService] Manual location set', { address });
    return locationData;
  }

  /**
   * Get cached location if available
   */
  public getCachedLocation(): LocationData | null {
    return this.cachedLocation ? { ...this.cachedLocation } : null;
  }

  /**
   * Clear cached location
   */
  public clearCachedLocation(): void {
    this.cachedLocation = null;
  }

  /**
   * Get location with fallback chain: GPS -> Cached -> Manual Entry Required
   * Never throws - always returns a valid response
   */
  public async getLocationWithFallback(previousAddress?: string): Promise<LocationData | null> {
    // Try GPS first
    const gpsLocation = await this.getCurrentLocation();
    if (gpsLocation) {
      return gpsLocation;
    }

    // Fall back to cached location
    const cached = this.getCachedLocation();
    if (cached && cached.address) {
      appLogger.infoSync('[LocationService] Using cached location');
      return { ...cached, source: LocationSourceType.CACHED };
    }

    // Fall back to previously entered address
    if (previousAddress && previousAddress.trim()) {
      appLogger.infoSync('[LocationService] Using previously entered location');
      return {
        address: previousAddress,
        source: LocationSourceType.CACHED,
        obtainedAt: new Date().toISOString(),
      };
    }

    // Return null - manual entry required
    appLogger.infoSync('[LocationService] No location available - manual entry required');
    featureCapabilities.getFeatureInfo(FeatureType.LOCATION);
    const degradationStore = useDegradationStore();
    degradationStore.setFeatureStatus(FeatureType.LOCATION, FeatureStatus.DEGRADED);

    return null;
  }

  /**
   * Get human-friendly location status message
   */
  public getStatusMessage(currentLocation?: LocationData): string {
    if (!currentLocation) {
      return 'No location available. Please enter your location manually.';
    }

    switch (currentLocation.source) {
      case LocationSourceType.GPS:
        return `Current location (${currentLocation.address || 'coordinates obtained'})`;
      case LocationSourceType.MANUAL:
        return `Your location: ${currentLocation.address}`;
      case LocationSourceType.CACHED:
        return `Saved location: ${currentLocation.address}`;
      case LocationSourceType.UNAVAILABLE:
      default:
        return 'Location unavailable - please enter manually';
    }
  }

  // ─── #591: position watcher + OS-level permission-revoke handling ──────────

  /**
   * Start a continuous position watcher and begin monitoring for OS-level
   * permission revocation. No-op (returns false) if permission is not granted;
   * safe to call repeatedly (will not register duplicate watchers).
   */
  public async startWatching(
    onUpdate?: (location: LocationData) => void,
    options?: Location.LocationOptions
  ): Promise<boolean> {
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      appLogger.infoSync('[LocationService] Cannot start watcher - permission not granted');
      this.setStorePermission(false);
      this.lastPermissionGranted = false;
      return false;
    }

    // Prevent duplicate watchers.
    if (this.watchSubscription) {
      appLogger.infoSync('[LocationService] Watcher already active - skipping duplicate registration');
      return true;
    }

    this.watchSubscription = await Location.watchPositionAsync(
      options ?? {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 0,
      },
      location => {
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || undefined,
          source: LocationSourceType.GPS,
          obtainedAt: new Date().toISOString(),
        };

        this.cachedLocation = locationData;
        useLocationStore.getState().setCoordinates({
          latitude: locationData.latitude as number,
          longitude: locationData.longitude as number,
          accuracy: locationData.accuracy,
          obtainedAt: locationData.obtainedAt,
        });

        onUpdate?.(locationData);
      }
    );

    this.lastPermissionGranted = true;
    this.setStorePermission(true);
    this.startPermissionMonitoring();

    appLogger.infoSync('[LocationService] Position watcher started');
    return true;
  }

  /**
   * Stop the active position watcher (if any) and release its native subscription.
   */
  public stopWatching(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
      appLogger.infoSync('[LocationService] Position watcher stopped');
    }
  }

  /**
   * Re-check OS location permission and react to a granted -> denied transition
   * by tearing down the watcher and purging all cached/stored coordinates.
   * Exposed publicly so it can be unit-tested and triggered on demand.
   */
  public async reconcilePermission(): Promise<void> {
    let granted = false;
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      this.locationPermissionStatus = status;
      granted = status === 'granted';
    } catch (error) {
      appLogger.errorSync('[LocationService] Error while re-checking permission', error instanceof Error ? error : new Error(String(error)));
      return;
    }

    if (this.lastPermissionGranted && !granted) {
      this.handlePermissionRevoked();
    }

    this.lastPermissionGranted = granted;
  }

  /**
   * Dispose of the watcher and all listeners. Call on logout / teardown.
   */
  public cleanup(): void {
    this.stopWatching();
    this.stopPermissionMonitoring();
    this.lastPermissionGranted = false;
  }

  /**
   * Full reset: cleanup + clear cached and stored coordinates. Useful for tests
   * and for a hard re-initialisation of the service.
   */
  public reset(): void {
    this.cleanup();
    this.clearCachedLocation();
    const store = useLocationStore.getState();
    store.clearLocation();
    store.setPermissionGranted(false);
  }

  private startPermissionMonitoring(): void {
    if (!this.appStateSubscription) {
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    }
    if (!this.permissionPollTimer) {
      this.permissionPollTimer = setInterval(() => {
        void this.reconcilePermission();
      }, PERMISSION_POLL_INTERVAL_MS);
    }
  }

  private stopPermissionMonitoring(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    if (this.permissionPollTimer) {
      clearInterval(this.permissionPollTimer);
      this.permissionPollTimer = null;
    }
  }

  private handleAppStateChange = (nextState: AppStateStatus): void => {
    if (nextState === 'active') {
      void this.reconcilePermission();
    }
  };

  /**
   * Tear down the watcher, purge cached + stored coordinates, flip permission
   * state, notify degradation store, and record the event.
   */
  private handlePermissionRevoked(): void {
    appLogger.warnSync('[LocationService] Location permission revoked at OS level - cleaning up');

    this.stopWatching();
    this.clearCachedLocation();

    const locationStore = useLocationStore.getState();
    locationStore.clearLocation();
    locationStore.setPermissionGranted(false);

    try {
      // Use getState() (not the hook) because this runs outside React.
      const degradationStore = useDegradationStore.getState();
      degradationStore.setFeatureStatus(FeatureType.LOCATION, FeatureStatus.DEGRADED);
      degradationStore.addNotification({
        feature: FeatureType.LOCATION,
        status: FeatureStatus.DEGRADED,
        message: 'Location permission was turned off. You can manually enter your location instead.',
      });
    } catch (error) {
      appLogger.errorSync('[LocationService] Failed to update degradation store after revoke', error instanceof Error ? error : new Error(String(error)));
    }

    // The watcher is gone; stop monitoring until watching restarts.
    this.stopPermissionMonitoring();
  }

  private setStorePermission(granted: boolean): void {
    useLocationStore.getState().setPermissionGranted(granted);
  }
}

export const locationService = LocationService.getInstance();

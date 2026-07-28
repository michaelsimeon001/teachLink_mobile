/**
 * Unit tests for LocationService OS-level permission-revocation handling (#591).
 */

import * as Location from 'expo-location';
import { AppState } from 'react-native';

import { locationService } from '../../services/locationService';
import { useLocationStore } from '../../store/locationStore';

jest.mock('expo-location', () => ({
  watchPositionAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

jest.mock('../../services/featureCapabilities', () => ({
  featureCapabilities: { getFeatureInfo: jest.fn() },
  FeatureStatus: {
    AVAILABLE: 'available',
    DEGRADED: 'degraded',
    UNAVAILABLE: 'unavailable',
    PERMISSION_DENIED: 'permission_denied',
    HARDWARE_UNAVAILABLE: 'hardware_unavailable',
  },
  FeatureType: { CAMERA: 'camera', PUSH_NOTIFICATIONS: 'push_notifications', LOCATION: 'location' },
}));

jest.mock('../../store/degradationStore', () => {
  const state = { setFeatureStatus: jest.fn(), addNotification: jest.fn() };
  const useDegradationStore: any = jest.fn(() => state);
  useDegradationStore.getState = jest.fn(() => state);
  return { useDegradationStore };
});

jest.mock('../../utils/logger', () => ({
  appLogger: {
    infoSync: jest.fn(),
    warnSync: jest.fn(),
    errorSync: jest.fn(),
    debugSync: jest.fn(),
  },
}));

const mockedLocation = Location as jest.Mocked<typeof Location>;
const flushPromises = () => new Promise<void>(resolve => setImmediate(resolve));

const grant = () =>
  mockedLocation.getForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);
const deny = () =>
  mockedLocation.getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);

describe('LocationService permission revoke handling (#591)', () => {
  let appStateHandler: ((state: string) => void) | undefined;
  let removeAppStateListener: jest.Mock;
  let watcherRemove: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    watcherRemove = jest.fn();
    mockedLocation.watchPositionAsync.mockResolvedValue({ remove: watcherRemove } as any);

    removeAppStateListener = jest.fn();
    appStateHandler = undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event: any, handler: any) => {
      if (event === 'change') {
        appStateHandler = handler;
      }
      return { remove: removeAppStateListener } as any;
    });

    // Start each test from a clean singleton + store.
    locationService.reset();
    useLocationStore.getState().clearLocation();
    useLocationStore.getState().setPermissionGranted(false);
  });

  afterEach(() => {
    locationService.reset();
  });

  it('does not start a watcher when permission was never granted', async () => {
    deny();

    const started = await locationService.startWatching();

    expect(started).toBe(false);
    expect(mockedLocation.watchPositionAsync).not.toHaveBeenCalled();
    expect(useLocationStore.getState().permissionGranted).toBe(false);
  });

  it('registers a watcher and marks permission granted after approval', async () => {
    grant();

    const started = await locationService.startWatching();

    expect(started).toBe(true);
    expect(mockedLocation.watchPositionAsync).toHaveBeenCalledTimes(1);
    expect(useLocationStore.getState().permissionGranted).toBe(true);
  });

  it('does not register a duplicate watcher when called twice', async () => {
    grant();

    await locationService.startWatching();
    await locationService.startWatching();

    expect(mockedLocation.watchPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('stores coordinates emitted by the watcher', async () => {
    grant();
    await locationService.startWatching();

    const callback = mockedLocation.watchPositionAsync.mock.calls[0][1] as (loc: any) => void;
    callback({ coords: { latitude: 6.5244, longitude: 3.3792, accuracy: 10 } });

    expect(useLocationStore.getState().coordinates).toEqual(
      expect.objectContaining({ latitude: 6.5244, longitude: 3.3792, accuracy: 10 })
    );
  });

  it('stops the watcher and clears location when permission is revoked', async () => {
    grant();
    await locationService.startWatching();

    const callback = mockedLocation.watchPositionAsync.mock.calls[0][1] as (loc: any) => void;
    callback({ coords: { latitude: 6.5244, longitude: 3.3792, accuracy: 10 } });
    expect(useLocationStore.getState().coordinates).not.toBeNull();

    // User revokes permission at the OS level.
    deny();
    await locationService.reconcilePermission();

    expect(watcherRemove).toHaveBeenCalledTimes(1);
    expect(useLocationStore.getState().coordinates).toBeNull();
    expect(useLocationStore.getState().permissionGranted).toBe(false);
  });

  it('detects revoke when the app returns to the foreground (AppState)', async () => {
    grant();
    await locationService.startWatching();
    expect(appStateHandler).toBeDefined();

    deny();
    appStateHandler?.('active');
    await flushPromises();

    expect(watcherRemove).toHaveBeenCalledTimes(1);
    expect(useLocationStore.getState().coordinates).toBeNull();
    expect(useLocationStore.getState().permissionGranted).toBe(false);
  });

  it('cleanup() removes the watcher and AppState listener', async () => {
    grant();
    await locationService.startWatching();

    locationService.cleanup();

    expect(watcherRemove).toHaveBeenCalledTimes(1);
    expect(removeAppStateListener).toHaveBeenCalledTimes(1);
  });
});

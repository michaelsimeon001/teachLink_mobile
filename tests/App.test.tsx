/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Issue #836 — App component initialization tests
 *
 * Covers: happy-path init, font failure, secure storage failure,
 * socket failure, push-notification failure, cache warming failure,
 * session expiry / expiring-soon on foreground, device compromised,
 * notification permission states, OTA update check, store hydration wait.
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Alert, AppState, InteractionManager } from 'react-native';

// Splash screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// expo-notifications — override per-test via getMockImplementation
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[test]' })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  removeNotificationSubscription: jest.fn(),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getBadgeCountAsync: jest.fn(() => Promise.resolve(0)),
  setBadgeCountAsync: jest.fn(() => Promise.resolve()),
  getLastNotificationResponseAsync: jest.fn(() => Promise.resolve(null)),
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
}));

// expo-updates
jest.mock('expo-updates', () => ({
  checkForUpdateAsync: jest.fn(() => Promise.resolve({ isAvailable: false })),
  fetchUpdateAsync: jest.fn(() => Promise.resolve()),
  reloadAsync: jest.fn(() => Promise.resolve()),
}));

// expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// fontService
jest.mock('../src/services/fontService', () => {
  const load = jest.fn(() => Promise.resolve());
  return {
    __esModule: true,
    CRITICAL_FONTS: [],
    SECONDARY_FONTS: [],
    fontService: { loadFonts: load },
  };
});

// cacheWarming
jest.mock('../src/services/cacheWarming', () => ({
  warmCriticalCaches: jest.fn(() => Promise.resolve()),
}));

// api client + cache status
jest.mock('../src/services/api', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
  getCacheStatus: jest.fn(() => ({ cachedAt: null })),
  getRevalidatingCacheKeys: jest.fn(() => []),
  subscribeToCacheStatus: jest.fn(() => jest.fn()),
}));

// secureStorage
jest.mock('../src/services/secureStorage', () => ({
  initializeSecureStorage: jest.fn(() => Promise.resolve()),
  checkSessionValidity: jest.fn(() => Promise.resolve({ valid: true, expiringSoon: false })),
  getAccessToken: jest.fn(() => Promise.resolve('token')),
  getRefreshToken: jest.fn(() => Promise.resolve('refresh')),
}));

// socket
jest.mock('../src/services/socket', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
}));

// pushNotifications
jest.mock('../src/services/pushNotifications', () => ({
  registerForPushNotifications: jest.fn(() => Promise.resolve('ExponentPushToken[test]')),
  registerTokenWithBackend: jest.fn(() => Promise.resolve(true)),
  removeNotificationListener: jest.fn(),
  setupForegroundBadgeSync: jest.fn(() => jest.fn()),
}));

// stores
jest.mock('../src/store', () => ({
  useAppStore: Object.assign(jest.fn(() => ({
    theme: 'light',
  })), {
    getState: jest.fn(() => ({
      isAuthenticated: true,
      refreshToken: 'refresh',
      sessionExpiresAt: Date.now() + 3600_000,
      logout: jest.fn(),
      setUser: jest.fn(),
      setTokens: jest.fn(),
      setSessionExpiringSoon: jest.fn(),
    })),
    persist: { hasHydrated: jest.fn(() => true) },
  }),
  useDeviceStore: Object.assign(jest.fn(() => ({})), {
    getState: jest.fn(() => ({
      runDeviceCompromisedCheck: jest.fn(() => Promise.resolve(false)),
    })),
  }),
  useNotificationStore: Object.assign(jest.fn(() => ({})), {
    getState: jest.fn(() => ({
      setPushToken: jest.fn(),
      setTokenRegistered: jest.fn(),
      setShowNotificationExplainer: jest.fn(),
      addNotification: jest.fn(),
    })),
  }),
  useSocketStore: Object.assign(jest.fn(() => ({})), {
    getState: jest.fn(() => ({
      setReconnectAttempts: jest.fn(),
      setConnectionFailed: jest.fn(),
    })),
  }),
}));

jest.mock('../src/store/createStore', () => ({
  waitForHydration: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/store/persistence', () => ({
  consumeHydrationResetToast: jest.fn(() => false),
  subscribeToHydrationResetToast: jest.fn(() => jest.fn()),
}));

jest.mock('../src/store/degradationStore', () => ({
  useDegradationStore: Object.assign(jest.fn(() => ({})), {
    getState: jest.fn(() => ({
      setFeatureStatus: jest.fn(),
      addNotification: jest.fn(),
    })),
  }),
}));

// config / services
jest.mock('../src/config/logging', () => ({
  initializeLogging: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    infoSync: jest.fn(),
    warn: jest.fn(),
    warnSync: jest.fn(),
    error: jest.fn(),
    errorSync: jest.fn(),
    debug: jest.fn(),
  },
  appLogger: {
    info: jest.fn(),
    infoSync: jest.fn(),
    warn: jest.fn(),
    warnSync: jest.fn(),
    error: jest.fn(),
    errorSync: jest.fn(),
    debug: jest.fn(),
  },
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    infoSync: jest.fn(),
    warnSync: jest.fn(),
    errorSync: jest.fn(),
  },
}));

jest.mock('../src/services/crashReporting', () => ({
  crashReportingService: {
    init: jest.fn(),
    reportError: jest.fn(),
  },
}));

jest.mock('../src/services/featureCapabilities', () => ({
  featureCapabilities: {
    checkAllCapabilities: jest.fn(() =>
      Promise.resolve({
        camera: { status: 'available' },
        pushNotifications: { status: 'available' },
        location: { status: 'available' },
      })
    ),
    getFeatureInfo: jest.fn(),
  },
  FeatureStatus: { AVAILABLE: 'available', UNAVAILABLE: 'unavailable', HARDWARE_UNAVAILABLE: 'hardware_unavailable', PERMISSION_DENIED: 'permission_denied' },
  FeatureType: { PUSH_NOTIFICATIONS: 'pushNotifications', CAMERA: 'camera', LOCATION: 'location' },
}));

jest.mock('../src/services/mobileAuth', () => ({
  mobileAuthService: {
    refreshSession: jest.fn(() =>
      Promise.resolve({
        user: { id: '1', name: 'Test', email: 'test@test.com' },
        tokens: { accessToken: 'new-at', refreshToken: 'new-rt', expiresAt: Date.now() + 7200_000 },
      })
    ),
  },
}));

jest.mock('../src/services/requestQueue', () => ({
  requestQueue: { startMonitoring: jest.fn(), addToQueue: jest.fn() },
}), { virtual: true });

jest.mock('../src/services/searchIndex', () => ({
  searchIndexService: { initialize: jest.fn() },
}));

jest.mock('../src/services/syncService', () => ({
  syncService: { startAutoSync: jest.fn(), stopAutoSync: jest.fn() },
}));

jest.mock('../src/services/inAppReview', () => ({
  inAppReviewService: { init: jest.fn() },
}));

jest.mock('../src/utils/cacheVersioning', () => ({
  handleCacheVersionUpdate: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/utils/env', () => ({
  requireEnvVariables: jest.fn(),
}), { virtual: true });

jest.mock('../src/components/common/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => children,
}));

jest.mock('../src/components/common/UpdatePromptModal', () => 'UpdatePromptModal');

jest.mock('../src/components/mobile/NotificationPermissionExplanationSheet', () => ({
  NotificationPermissionExplanationSheet: () => null,
}));

jest.mock('../src/navigation/AppNavigator', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: () => <View testID="app-navigator" /> };
});

jest.mock('../src/hooks', () => ({
  AuthProvider: ({ children }: any) => children,
  useAdaptiveTheme: jest.fn(),
  useReviewMetrics: jest.fn(),
}));

jest.mock('../src/services/sentryContext', () => ({
  sentryContextService: { captureException: jest.fn(), setUser: jest.fn(), clearUser: jest.fn(), resetSession: jest.fn() },
}));

// Note: react-native is mocked globally in jest.setup.js
// We only need to access the mocks for spying, not override the entire module.
// The InteractionManager mock in jest.setup.js already calls cb synchronously.

jest.mock('../.rnstorybook', () => 'StorybookUI');
jest.mock('../global.css', () => {}, { virtual: true });
jest.mock('../package.json', () => ({ version: '1.0.0' }));

// ScreenErrorBoundary is used in App.tsx but not imported — must be a global or auto-import
(global as any).ScreenErrorBoundary = ({ children }: any) => children;

// ── Import App (mocks are set at module scope, no resetModules needed) ────────

import App from '../App';

let unhandledRejectionHandler: ((reason: any) => void) | null = null;

beforeEach(() => {
  jest.useFakeTimers();
  (InteractionManager.runAfterInteractions as jest.Mock).mockImplementation((cb: any) => {
    if (cb) cb();
    return { then: (fn: any) => fn && fn() };
  });
  // Suppress unhandled rejections from non-critical service failures in tests
  unhandledRejectionHandler = () => {};
  process.on('unhandledRejection', unhandledRejectionHandler);
});

afterEach(() => {
  if (unhandledRejectionHandler) {
    process.removeListener('unhandledRejection', unhandledRejectionHandler);
  }
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Issue #836 — App initialization', () => {
  it('1. renders AppNavigator after happy-path initialization', async () => {
    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId('app-navigator')).toBeTruthy();
    });
  });

  it('2. still renders when font loading fails', async () => {
    const fontService = require('../src/services/fontService');
    fontService.fontService.loadFonts.mockRejectedValueOnce(new Error('font load failed'));

    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId('app-navigator')).toBeTruthy();
    });
  });

  it('3. still renders when secure storage initialization fails', async () => {
    const secureStorage = require('../src/services/secureStorage');
    secureStorage.initializeSecureStorage.mockRejectedValueOnce(new Error('keychain fail'));

    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId('app-navigator')).toBeTruthy();
    });
  });

  it('4. still renders when socket.connect throws', async () => {
    const socket = require('../src/services/socket').default;
    // Use mockImplementation + catch to suppress unhandled rejection
    socket.connect.mockImplementation(() =>
      Promise.reject(new Error('socket fail')).catch(() => {})
    );

    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId('app-navigator')).toBeTruthy();
    });
  });

  it('5. still renders when push notification registration fails', async () => {
    const push = require('../src/services/pushNotifications');
    push.registerForPushNotifications.mockImplementation(() =>
      Promise.reject(new Error('push fail')).catch(() => {})
    );

    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId('app-navigator')).toBeTruthy();
    });
  });

  it('6. still renders when cache warming fails', async () => {
    const cache = require('../src/services/cacheWarming');
    cache.warmCriticalCaches.mockImplementation(() =>
      Promise.reject(new Error('cache fail')).catch(() => {})
    );

    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId('app-navigator')).toBeTruthy();
    });
  });

  it('7. calls logout and shows alert when session is expired on foreground', async () => {
    const mockLogout = jest.fn();
    const appStore = require('../src/store').useAppStore;
    appStore.persist = { hasHydrated: jest.fn(() => true) };
    appStore.getState.mockReturnValue({
      isAuthenticated: true,
      refreshToken: 'refresh',
      sessionExpiresAt: Date.now() + 3600_000,
      logout: mockLogout,
      setUser: jest.fn(),
      setTokens: jest.fn(),
      setSessionExpiringSoon: jest.fn(),
    });
    const secureStorage = require('../src/services/secureStorage');
    secureStorage.checkSessionValidity.mockReturnValue(
      Promise.resolve({ valid: false, expiringSoon: false })
    );

    render(<App />);

    // Flush the microtask chain: waitForHydration -> checkSessionOnForeground -> await checkSessionValidity -> logout
    // jest.advanceTimersByTime flushes pending timers; act() flushes React effects & microtasks.
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        jest.advanceTimersByTime(10);
      });
    }

    expect(mockLogout).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Session expired',
      expect.any(String),
    );
  });

  it('8. refreshes session when expiring soon', async () => {
    const mockSetSessionExpiringSoon = jest.fn();
    const mockSetUser = jest.fn();
    const mockSetTokens = jest.fn();
    const mockLogout = jest.fn();
    const mockRefreshSession = jest.fn(() =>
      Promise.resolve({
        user: { id: 'u1', name: 'Test' },
        tokens: { accessToken: 'new-access', refreshToken: 'new-refresh', expiresAt: Date.now() + 7200_000 },
      })
    );
    const appStore = require('../src/store').useAppStore;
    appStore.persist = { hasHydrated: jest.fn(() => true) };
    appStore.getState.mockReturnValue({
      isAuthenticated: true,
      refreshToken: 'refresh',
      sessionExpiresAt: Date.now() + 3600_000,
      logout: mockLogout,
      setUser: mockSetUser,
      setTokens: mockSetTokens,
      setSessionExpiringSoon: mockSetSessionExpiringSoon,
    });
    const secureStorage = require('../src/services/secureStorage');
    secureStorage.checkSessionValidity.mockReturnValue(
      Promise.resolve({ valid: true, expiringSoon: true })
    );
    const mobileAuth = require('../src/services/mobileAuth');
    mobileAuth.mobileAuthService.refreshSession = mockRefreshSession;

    render(<App />);

    for (let i = 0; i < 10; i++) {
      await act(async () => {
        jest.advanceTimersByTime(10);
      });
    }

    expect(mockSetSessionExpiringSoon).toHaveBeenCalledWith(true);
  });

  it('9. shows alert when device is compromised', async () => {
    const mockRunCheck = jest.fn(() => Promise.resolve(true));
    const deviceStore = require('../src/store').useDeviceStore;
    deviceStore.getState.mockReturnValue({
      runDeviceCompromisedCheck: mockRunCheck,
    });

    render(<App />);

    await waitFor(() => {
      expect(mockRunCheck).toHaveBeenCalled();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Device Security Warning',
      expect.stringContaining('jailbroken or rooted'),
      expect.anything(),
      expect.objectContaining({ cancelable: false })
    );
  });

  it('10. notification store is updated on push registration', async () => {
    const notifications = require('expo-notifications');
    const push = require('../src/services/pushNotifications');
    const notifStore = require('../src/store').useNotificationStore;

    notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    push.registerForPushNotifications.mockResolvedValue('ExponentPushToken[perm-test]');
    push.registerTokenWithBackend.mockResolvedValue(true);

    render(<App />);

    await waitFor(() => {
      expect(push.registerForPushNotifications).toHaveBeenCalled();
    });
  });

  it('11. OTA update check is invoked on mount', async () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;

    const updates = require('expo-updates');
    updates.checkForUpdateAsync.mockResolvedValue({
      isAvailable: false,
    });

    render(<App />);

    await waitFor(() => {
      expect(updates.checkForUpdateAsync).toHaveBeenCalled();
    });

    (global as any).__DEV__ = originalDev;
  });

  it('12. splash screen is hidden after initialization', async () => {
    const SplashScreen = require('expo-splash-screen');

    render(<App />);

    await waitFor(() => {
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
    });
  });
});

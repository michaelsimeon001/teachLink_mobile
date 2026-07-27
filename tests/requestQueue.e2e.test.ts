import AsyncStorage from '@react-native-async-storage/async-storage';
import { InternalAxiosRequestConfig } from 'axios';
import * as Network from 'expo-network';

import { requestQueue } from '../src/services/api/requestQueue';
import * as secureStorage from '../src/services/secureStorage';
import { useAppStore } from '../src/store';

jest.mock('../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    errorSync: jest.fn(),
    warnSync: jest.fn(),
  },
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock('../src/services/mobileAnalytics', () => ({
  mobileAnalyticsService: { trackEvent: jest.fn() },
}));

jest.mock('../src/services/secureStorage', () => ({
  isSessionValid: jest.fn(() => Promise.resolve(true)),
  refreshAccessToken: jest.fn(),
}));

jest.mock('../src/store', () => ({
  useAppStore: {
    getState: jest.fn(() => ({
      logout: jest.fn(),
      setTokens: jest.fn(),
    })),
  },
}));

const mockConfig = (
  overrides: Partial<InternalAxiosRequestConfig> = {}
): InternalAxiosRequestConfig =>
  ({
    method: 'GET',
    url: '/api/courses',
    headers: {},
    data: undefined,
    ...overrides,
  }) as InternalAxiosRequestConfig;

const mockStore: Record<string, string> = {};

function setupAsyncStorageMock() {
  (AsyncStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
    mockStore[key] = value;
    return Promise.resolve();
  });
  (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) =>
    Promise.resolve(mockStore[key] ?? null)
  );
  (AsyncStorage.removeItem as jest.Mock).mockImplementation((key: string) => {
    delete mockStore[key];
    return Promise.resolve();
  });
}

describe('requestQueue offline-to-online sync E2E (#840)', () => {
  const mockIsSessionValid = secureStorage.isSessionValid as jest.MockedFunction<
    typeof secureStorage.isSessionValid
  >;
  const mockRefresh = secureStorage.refreshAccessToken as jest.MockedFunction<
    typeof secureStorage.refreshAccessToken
  >;
  const mockLogout = jest.fn();
  const mockSetTokens = jest.fn();

  beforeEach(async () => {
    Object.keys(mockStore).forEach(k => delete mockStore[k]);
    setupAsyncStorageMock();
    mockLogout.mockReset();
    mockSetTokens.mockReset();
    mockIsSessionValid.mockResolvedValue(true);
    mockRefresh.mockResolvedValue({
      accessToken: 'fresh-access-token',
      refreshToken: 'fresh-refresh-token',
      expiresAt: Date.now() + 3_600_000,
    });
    (useAppStore.getState as jest.Mock).mockReturnValue({
      logout: mockLogout,
      setTokens: mockSetTokens,
    });

    jest.spyOn(Network, 'getNetworkStateAsync').mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
      type: 'NONE',
    } as any);
  });

  afterEach(async () => {
    requestQueue.stopMonitoring();
    jest.restoreAllMocks();
  });

  function goOnline() {
    jest.spyOn(Network, 'getNetworkStateAsync').mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'WIFI',
    } as any);
  }

  it('queues requests while offline, drains them in FIFO order after reconnect', async () => {
    const callOrder: string[] = [];
    const client = jest.fn().mockImplementation((cfg: InternalAxiosRequestConfig) => {
      callOrder.push(cfg.url!);
      return Promise.resolve({ data: 'ok' });
    });

    const id1 = await requestQueue.addToQueue(mockConfig({ url: '/api/a', method: 'POST' }));
    const id2 = await requestQueue.addToQueue(mockConfig({ url: '/api/b', method: 'POST' }));
    const id3 = await requestQueue.addToQueue(mockConfig({ url: '/api/c', method: 'POST' }));

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id3).toBeTruthy();

    let queue = await requestQueue.getQueue();
    expect(queue).toHaveLength(3);

    await requestQueue.processQueue(client);
    expect(client).not.toHaveBeenCalled();

    queue = await requestQueue.getQueue();
    expect(queue).toHaveLength(3);

    goOnline();
    await requestQueue.processQueue(client);

    expect(client).toHaveBeenCalledTimes(3);
    expect(callOrder).toEqual(['/api/a', '/api/b', '/api/c']);

    queue = await requestQueue.getQueue();
    expect(queue).toHaveLength(0);
  });

  it('preserves FIFO within the same priority level', async () => {
    const client = jest.fn().mockResolvedValue({ data: 'ok' });

    await requestQueue.addToQueue(mockConfig({ url: '/first' }), 'normal');
    await requestQueue.addToQueue(mockConfig({ url: '/second' }), 'normal');
    await requestQueue.addToQueue(mockConfig({ url: '/third' }), 'normal');

    goOnline();
    await requestQueue.processQueue(client);

    expect(client).toHaveBeenCalledTimes(3);
    expect(client.mock.calls[0][0].url).toBe('/first');
    expect(client.mock.calls[1][0].url).toBe('/second');
    expect(client.mock.calls[2][0].url).toBe('/third');
  });

  it('batches multiple PUT requests to the same endpoint into one call', async () => {
    const client = jest.fn().mockResolvedValue({ data: 'ok' });

    await requestQueue.addToQueue(
      mockConfig({ method: 'PUT', url: '/api/profile', data: { name: 'a' } })
    );
    await requestQueue.addToQueue(
      mockConfig({ method: 'PUT', url: '/api/profile', data: { name: 'b' } })
    );

    goOnline();
    await requestQueue.processQueue(client);

    expect(client).toHaveBeenCalledTimes(1);
  });

  it('retries failed requests and eventually drops after max retries', async () => {
    const client = jest.fn().mockRejectedValue(new Error('Server 500'));

    await requestQueue.addToQueue(mockConfig({ url: '/flaky' }));
    goOnline();

    await requestQueue.processQueue(client);
    let queue = await requestQueue.getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].retries).toBe(1);

    await requestQueue.processQueue(client);
    queue = await requestQueue.getQueue();
    expect(queue[0].retries).toBe(2);

    await requestQueue.processQueue(client);
    queue = await requestQueue.getQueue();
    expect(queue[0].retries).toBe(3);

    await requestQueue.processQueue(client);
    queue = await requestQueue.getQueue();
    expect(queue).toHaveLength(0);
  });

  it('processes critical requests before low-priority ones', async () => {
    const callOrder: string[] = [];
    const client = jest.fn().mockImplementation((cfg: InternalAxiosRequestConfig) => {
      callOrder.push(cfg.url!);
      return Promise.resolve({ data: 'ok' });
    });

    await requestQueue.addToQueue(mockConfig({ url: '/low-1' }), 'low');
    await requestQueue.addToQueue(mockConfig({ url: '/critical-1' }), 'critical');
    await requestQueue.addToQueue(mockConfig({ url: '/normal-1' }), 'normal');

    goOnline();
    await requestQueue.processQueue(client);

    expect(callOrder[0]).toBe('/critical-1');
    expect(callOrder[2]).toBe('/low-1');
  });

  it('clears queue and logs out when session refresh fails', async () => {
    mockIsSessionValid.mockResolvedValue(false);
    mockRefresh.mockRejectedValue(new Error('Refresh failed'));

    const client = jest.fn().mockResolvedValue({ data: 'ok' });
    await requestQueue.addToQueue(mockConfig());

    goOnline();
    await requestQueue.processQueue(client);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(client).not.toHaveBeenCalled();

    const queue = await requestQueue.getQueue();
    expect(queue).toHaveLength(0);
  });
});

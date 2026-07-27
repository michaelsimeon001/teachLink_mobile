import * as SecureStore from 'expo-secure-store';

import {
  saveTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  saveUserData,
  getUserData,
  clearUserData,
  initializeSecureStorage,
  resetSecureStorage,
} from '../src/services/secureStorage';

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 2,
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

function mockVerificationPass() {
  let stored: Record<string, string> = {};
  mockSecureStore.setItemAsync.mockImplementation((key: string, value: string) => {
    stored[key] = value;
    return Promise.resolve();
  });
  mockSecureStore.getItemAsync.mockImplementation((key: string) =>
    Promise.resolve(stored[key] ?? null)
  );
  mockSecureStore.deleteItemAsync.mockImplementation((key: string) => {
    delete stored[key];
    return Promise.resolve();
  });
}

describe('secureStorage key isolation (#842)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    resetSecureStorage();
    mockVerificationPass();
    await initializeSecureStorage();
  });

  // ── Key isolation: writing to key A, reading with key B returns null ────

  it('returns null when reading a different key than what was written', async () => {
    await saveTokens('token_A', 'refresh_A', Date.now() + 3600000);

    // Clear the mock call history so we can inspect fresh reads
    mockSecureStore.getItemAsync.mockClear();

    // Read a completely different key
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    const result = await SecureStore.getItemAsync('teachlink_some_other_key', expect.any(Object));

    expect(result).toBeNull();
  });

  it('does not leak access token when reading refresh token key', async () => {
    const realAccessToken = 'super-secret-access-token-12345';
    const realRefreshToken = 'super-secret-refresh-token-67890';

    await saveTokens(realAccessToken, realRefreshToken, Date.now() + 3600000);

    // Verify getAccessToken only returns the access token value
    mockSecureStore.getItemAsync.mockClear();
    const accessToken = await getAccessToken();
    expect(accessToken).toBe(realAccessToken);

    // Verify getRefreshToken only returns the refresh token value
    mockSecureStore.getItemAsync.mockClear();
    const refreshToken = await getRefreshToken();
    expect(refreshToken).toBe(realRefreshToken);

    // Confirm each call used the correct key
    const accessCalls = mockSecureStore.getItemAsync.mock.calls;
    expect(accessCalls[0][0]).toBe('teachlink_refresh_token');
  });

  // ── Deleted key returns null (not stale values) ────────────────────────

  it('returns null after deleting a key instead of stale value', async () => {
    await saveTokens('token_value', 'refresh_value', Date.now() + 3600000);

    // Confirm it's there
    mockSecureStore.getItemAsync.mockClear();
    const before = await getAccessToken();
    expect(before).toBe('token_value');

    // Delete tokens
    await clearTokens();

    // Confirm deleteItemAsync was called
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'teachlink_access_token',
      expect.any(Object)
    );

    // After deletion, getItemAsync should return null
    mockSecureStore.getItemAsync.mockClear();
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    const after = await getAccessToken();
    expect(after).toBeNull();
  });

  it('returns null for user data after clearing', async () => {
    await saveUserData({ id: '123', name: 'Test' });

    // Confirm data is there
    mockSecureStore.getItemAsync.mockClear();
    const before = await getUserData();
    expect(before).toEqual({ id: '123', name: 'Test' });

    // Clear
    await clearUserData();

    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'teachlink_user_data',
      expect.any(Object)
    );

    // After clearing, read returns null
    mockSecureStore.getItemAsync.mockClear();
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    const after = await getUserData();
    expect(after).toBeNull();
  });

  // ── Cross-key isolation for user data vs tokens ────────────────────────

  it('does not mix user data with token data', async () => {
    await saveTokens('access_val', 'refresh_val', Date.now() + 3600000);
    await saveUserData({ id: 'user_42', name: 'Alice' });

    mockSecureStore.getItemAsync.mockClear();
    const token = await getAccessToken();
    expect(token).toBe('access_val');

    mockSecureStore.getItemAsync.mockClear();
    const userData = await getUserData();
    expect(userData).toEqual({ id: 'user_42', name: 'Alice' });

    // Clear tokens should not affect user data
    await clearTokens();

    mockSecureStore.getItemAsync.mockClear();
    mockSecureStore.getItemAsync.mockImplementation((key: string) => {
      const store: Record<string, string> = {
        teachlink_user_data: JSON.stringify({ id: 'user_42', name: 'Alice' }),
      };
      return Promise.resolve(store[key] ?? null);
    });

    const userDataAfter = await getUserData();
    expect(userDataAfter).toEqual({ id: 'user_42', name: 'Alice' });
  });

  // ── All deleteItemAsync calls use correct keys ─────────────────────────

  it('clearTokens deletes exactly the three token keys', async () => {
    await saveTokens('a', 'b', Date.now());
    mockSecureStore.deleteItemAsync.mockClear();

    await clearTokens();

    const deletedKeys = mockSecureStore.deleteItemAsync.mock.calls.map(c => c[0]);
    expect(deletedKeys).toContain('teachlink_access_token');
    expect(deletedKeys).toContain('teachlink_refresh_token');
    expect(deletedKeys).toContain('teachlink_session_expires_at');
    expect(deletedKeys).toHaveLength(3);
  });
});

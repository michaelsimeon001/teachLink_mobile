/**
 * Fix for issue #926:
 * Token refresh in axios.config.ts used `apiClient` itself, causing a refresh
 * 401 to re-enter the same interceptor and creating an infinite loop.
 *
 * Solution: Use a dedicated plain axios instance (`refreshClient`) for the
 * token refresh call so it bypasses the response interceptor entirely.
 */
import axios from 'axios';

import { getEnv } from '../../config';
import { getStoredTokens, storeTokens, clearTokens } from '../secureStorage';

/** Plain axios instance with no interceptors - used only for token refresh */
export const refreshClient = axios.create({
  baseURL: getEnv('EXPO_PUBLIC_API_BASE_URL'),
  timeout: 10_000,
});

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Uses `refreshClient` (not `apiClient`) to avoid re-entering the interceptor.
 *
 * @returns new access token string
 * @throws if refresh fails (caller should clear session)
 */
export async function refreshAccessToken(): Promise<string> {
  const tokens = await getStoredTokens();

  if (!tokens?.refreshToken) {
    await clearTokens();
    throw new Error('No refresh token available');
  }

  const response = await refreshClient.post<{ accessToken: string }>(
    '/auth/refresh',
    { refreshToken: tokens.refreshToken },
  );

  const { accessToken } = response.data;
  await storeTokens({ ...tokens, accessToken });
  return accessToken;
}
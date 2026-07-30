/**
 * Unit tests for MobileAuthService biometric re-enrollment flow.
 *
 * Covers:
 * - enableBiometrics / disableBiometrics
 * - isBiometricAvailable / getSupportedBiometricType
 * - loginWithBiometrics (including re-enrollment detection)
 * - checkBiometricReenrollment
 * - reEnrollBiometrics
 * - BiometricReenrollmentError
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../services/api/axios.config', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('../../services/secureStorage', () => ({
  isBiometricEnabled: jest.fn(),
  setBiometricEnabled: jest.fn(),
  saveBiometricEnrollmentId: jest.fn(),
  getBiometricEnrollmentId: jest.fn(),
  clearBiometricEnrollmentId: jest.fn(),
  isSessionValid: jest.fn(),
  getRefreshToken: jest.fn(),
  getUserData: jest.fn(),
  getAccessToken: jest.fn(),
  getSessionExpiresAt: jest.fn(),
  saveTokens: jest.fn(),
  saveUserData: jest.fn(),
  setRememberMe: jest.fn(),
  saveRememberedEmail: jest.fn(),
  isRememberMeEnabled: jest.fn(),
  getRememberedEmail: jest.fn(),
  clearAllAuthData: jest.fn(),
  isSecureStorageReady: jest.fn(),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import * as LocalAuthentication from 'expo-local-authentication';
import apiClient from '../../services/api/axios.config';
import {
    BiometricReenrollmentError,
    isValidBiometricType,
    mobileAuthService,
    VALID_BIOMETRIC_TYPES,
} from '../../services/mobileAuth';
import * as secureStorage from '../../services/secureStorage';

// ─── Mock references ─────────────────────────────────────────────────────────

const mockSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockLocalAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;

// ─── Test data ────────────────────────────────────────────────────────────────

const MOCK_USER = { id: 'u1', name: 'Ada Lovelace', email: 'ada@teachlink.com' };
const MOCK_TOKENS = {
  accessToken: 'at_abc',
  refreshToken: 'rt_xyz',
  expiresAt: Date.now() + 3_600_000,
};
const MOCK_AUTH_RESULT = { user: MOCK_USER, tokens: MOCK_TOKENS };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetAllMocks() {
  jest.clearAllMocks();
  // Default: secure storage is ready
  mockSecureStorage.isSecureStorageReady.mockReturnValue(true);
}

function setupBiometricAvailable() {
  mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
  mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
}

function setupBiometricUnavailable() {
  mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
  mockLocalAuth.isEnrolledAsync.mockResolvedValue(false);
}

function setupAuthSuccess() {
  mockLocalAuth.authenticateAsync.mockResolvedValue({ success: true, error: null });
}

function setupAuthFailure() {
  mockLocalAuth.authenticateAsync.mockResolvedValue({ success: false, error: 'cancelled' });
}

function setupValidSession() {
  mockSecureStorage.isSessionValid.mockResolvedValue(true);
  mockSecureStorage.getUserData.mockResolvedValue(MOCK_USER);
  mockSecureStorage.getAccessToken.mockResolvedValue(MOCK_TOKENS.accessToken);
  mockSecureStorage.getRefreshToken.mockResolvedValue(MOCK_TOKENS.refreshToken);
  mockSecureStorage.getSessionExpiresAt.mockResolvedValue(MOCK_TOKENS.expiresAt);
}

function setupNoSession() {
  mockSecureStorage.isSessionValid.mockResolvedValue(false);
  mockSecureStorage.getRefreshToken.mockResolvedValue(null);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MobileAuthService — Biometric Re-enrollment Flow', () => {
  beforeEach(() => resetAllMocks());

  // ── BiometricReenrollmentError ────────────────────────────────────────────

  describe('BiometricReenrollmentError', () => {
    it('should have the correct name and code', () => {
      const error = new BiometricReenrollmentError();
      expect(error.name).toBe('BiometricReenrollmentError');
      expect(error.code).toBe('BIOMETRIC_REENROLLMENT_REQUIRED');
    });

    it('should use the default message', () => {
      const error = new BiometricReenrollmentError();
      expect(error.message).toContain('biometric enrollment has changed');
    });

    it('should accept a custom message', () => {
      const error = new BiometricReenrollmentError('Custom message');
      expect(error.message).toBe('Custom message');
    });

    it('should be an instance of Error', () => {
      const error = new BiometricReenrollmentError();
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ── isBiometricAvailable ──────────────────────────────────────────────────

  describe('isBiometricAvailable', () => {
    it('should return true when hardware is available and biometrics are enrolled', async () => {
      setupBiometricAvailable();

      const result = await mobileAuthService.isBiometricAvailable();

      expect(result).toBe(true);
      expect(mockLocalAuth.hasHardwareAsync).toHaveBeenCalled();
      expect(mockLocalAuth.isEnrolledAsync).toHaveBeenCalled();
    });

    it('should return false when hardware is not available', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);

      const result = await mobileAuthService.isBiometricAvailable();

      expect(result).toBe(false);
    });

    it('should return false when no biometrics are enrolled', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(false);

      const result = await mobileAuthService.isBiometricAvailable();

      expect(result).toBe(false);
    });

    it('should return false when both hardware and enrollment are unavailable', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(false);

      const result = await mobileAuthService.isBiometricAvailable();

      expect(result).toBe(false);
    });

    it('should return false when expo-local-authentication throws', async () => {
      mockLocalAuth.hasHardwareAsync.mockRejectedValue(new Error('Module not found'));

      const result = await mobileAuthService.isBiometricAvailable();

      expect(result).toBe(false);
    });
  });

  // ── getSupportedBiometricType ─────────────────────────────────────────────

  describe('getSupportedBiometricType', () => {
    it('should return "fingerprint" when biometric type is supported', async () => {
      mockLocalAuth.getSupportedAuthenticationTypesAsync.mockResolvedValue([1]);

      const result = await mobileAuthService.getSupportedBiometricType();

      expect(result).toBe('fingerprint');
    });

    it('should return "none" when no biometric type is supported', async () => {
      mockLocalAuth.getSupportedAuthenticationTypesAsync.mockResolvedValue([2]);

      const result = await mobileAuthService.getSupportedBiometricType();

      expect(result).toBe('none');
    });

    it('should return "none" when the types array is empty', async () => {
      mockLocalAuth.getSupportedAuthenticationTypesAsync.mockResolvedValue([]);

      const result = await mobileAuthService.getSupportedBiometricType();

      expect(result).toBe('none');
    });

    it('should return "none" when expo-local-authentication throws', async () => {
      mockLocalAuth.getSupportedAuthenticationTypesAsync.mockRejectedValue(new Error('Failed'));

      const result = await mobileAuthService.getSupportedBiometricType();

      expect(result).toBe('none');
    });
  });

  // ── enableBiometrics ──────────────────────────────────────────────────────

  describe('enableBiometrics', () => {
    it('should enable biometrics when available and auth succeeds', async () => {
      setupBiometricAvailable();
      setupAuthSuccess();

      await mobileAuthService.enableBiometrics();

      expect(mockSecureStorage.setBiometricEnabled).toHaveBeenCalledWith(true);
      expect(mockSecureStorage.saveBiometricEnrollmentId).toHaveBeenCalled();
      // Verify an enrollment id was saved
      const savedId = mockSecureStorage.saveBiometricEnrollmentId.mock.calls[0][0];
      expect(savedId).toBeTruthy();
      expect(typeof savedId).toBe('string');
    });

    it('should throw when biometrics are not available', async () => {
      setupBiometricUnavailable();

      await expect(mobileAuthService.enableBiometrics()).rejects.toThrow(
        'Biometric authentication is not available on this device.'
      );

      expect(mockSecureStorage.setBiometricEnabled).not.toHaveBeenCalled();
      expect(mockSecureStorage.saveBiometricEnrollmentId).not.toHaveBeenCalled();
    });

    it('should throw when biometric auth fails', async () => {
      setupBiometricAvailable();
      setupAuthFailure();

      await expect(mobileAuthService.enableBiometrics()).rejects.toThrow(
        'Biometric authentication was cancelled or failed.'
      );

      expect(mockSecureStorage.setBiometricEnabled).not.toHaveBeenCalled();
      expect(mockSecureStorage.saveBiometricEnrollmentId).not.toHaveBeenCalled();
    });

    it('should generate a unique enrollment id each time', async () => {
      setupBiometricAvailable();
      setupAuthSuccess();

      await mobileAuthService.enableBiometrics();
      const id1 = mockSecureStorage.saveBiometricEnrollmentId.mock.calls[0][0];

      await mobileAuthService.enableBiometrics();
      const id2 = mockSecureStorage.saveBiometricEnrollmentId.mock.calls[1][0];

      expect(id1).not.toBe(id2);
    });
  });

  // ── disableBiometrics ─────────────────────────────────────────────────────

  describe('disableBiometrics', () => {
    it('should disable biometrics and clear the enrollment id', async () => {
      await mobileAuthService.disableBiometrics();

      expect(mockSecureStorage.setBiometricEnabled).toHaveBeenCalledWith(false);
      expect(mockSecureStorage.clearBiometricEnrollmentId).toHaveBeenCalled();
    });
  });

  // ── checkBiometricReenrollment ────────────────────────────────────────────

  describe('checkBiometricReenrollment', () => {
    it('should return false when biometrics are not enabled', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(false);

      const result = await mobileAuthService.checkBiometricReenrollment();

      expect(result).toBe(false);
    });

    it('should return false when biometrics are not available', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricUnavailable();

      const result = await mobileAuthService.checkBiometricReenrollment();

      expect(result).toBe(false);
    });

    it('should return true when the enrollment id is missing', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricAvailable();
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue(null);

      const result = await mobileAuthService.checkBiometricReenrollment();

      expect(result).toBe(true);
    });

    it('should return true when session is invalid and no refresh token exists', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricAvailable();
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue('enrollment-123');
      mockSecureStorage.isSessionValid.mockResolvedValue(false);
      mockSecureStorage.getRefreshToken.mockResolvedValue(null);

      const result = await mobileAuthService.checkBiometricReenrollment();

      expect(result).toBe(true);
    });

    it('should return false when session is valid', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricAvailable();
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue('enrollment-123');
      mockSecureStorage.isSessionValid.mockResolvedValue(true);

      const result = await mobileAuthService.checkBiometricReenrollment();

      expect(result).toBe(false);
    });

    it('should return false when session is invalid but refresh token exists', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricAvailable();
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue('enrollment-123');
      mockSecureStorage.isSessionValid.mockResolvedValue(false);
      mockSecureStorage.getRefreshToken.mockResolvedValue('rt_xyz');

      const result = await mobileAuthService.checkBiometricReenrollment();

      expect(result).toBe(false);
    });

    it('should return true when secure storage access throws', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricAvailable();
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue('enrollment-123');
      mockSecureStorage.isSessionValid.mockRejectedValue(new Error('Keychain access denied'));

      const result = await mobileAuthService.checkBiometricReenrollment();

      expect(result).toBe(true);
    });
  });

  // ── loginWithBiometrics ───────────────────────────────────────────────────

  describe('loginWithBiometrics', () => {
    it('should succeed when biometrics are enabled, available, and session exists', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricAvailable();
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue('enrollment-123');
      setupValidSession();
      setupAuthSuccess();

      const result = await mobileAuthService.loginWithBiometrics();

      expect(result).toEqual(MOCK_AUTH_RESULT);
      expect(mockLocalAuth.authenticateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          promptMessage: 'Unlock with biometrics',
        })
      );
    });

    it('should throw when biometrics are not enabled', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(false);

      await expect(mobileAuthService.loginWithBiometrics()).rejects.toThrow(
        'Biometric login is not enabled. Please enable it in settings.'
      );
    });

    it('should throw when biometrics are not available', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricUnavailable();

      await expect(mobileAuthService.loginWithBiometrics()).rejects.toThrow(
        'Biometric authentication is not available on this device.'
      );
    });

    it('should throw BiometricReenrollmentError when enrollment has changed', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricAvailable();
      // Simulate enrollment change: enrollment id is missing
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue(null);

      await expect(mobileAuthService.loginWithBiometrics()).rejects.toThrow(
        BiometricReenrollmentError
      );

      // Should NOT have prompted for biometric auth
      expect(mockLocalAuth.authenticateAsync).not.toHaveBeenCalled();
    });

    it('should throw BiometricReenrollmentError when session is invalid and no refresh token', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricAvailable();
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue('enrollment-123');
      mockSecureStorage.isSessionValid.mockResolvedValue(false);
      mockSecureStorage.getRefreshToken.mockResolvedValue(null);

      await expect(mobileAuthService.loginWithBiometrics()).rejects.toThrow(
        BiometricReenrollmentError
      );
    });

    it('should throw when biometric auth fails', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricAvailable();
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue('enrollment-123');
      setupValidSession();
      setupAuthFailure();

      await expect(mobileAuthService.loginWithBiometrics()).rejects.toThrow(
        'Biometric authentication was cancelled or failed.'
      );
    });

    it('should throw when no stored session is found', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricAvailable();
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue('enrollment-123');
      setupAuthSuccess();
      setupNoSession();

      await expect(mobileAuthService.loginWithBiometrics()).rejects.toThrow(
        'No stored session found. Please log in with your password.'
      );
    });

    it('should not call authenticateAsync when re-enrollment is needed', async () => {
      mockSecureStorage.isBiometricEnabled.mockResolvedValue(true);
      setupBiometricAvailable();
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue(null);

      try {
        await mobileAuthService.loginWithBiometrics();
      } catch {
        // Expected
      }

      expect(mockLocalAuth.authenticateAsync).not.toHaveBeenCalled();
    });
  });

  // ── reEnrollBiometrics ────────────────────────────────────────────────────

  describe('reEnrollBiometrics', () => {
    it('should re-enroll when available and auth succeeds', async () => {
      setupBiometricAvailable();
      setupAuthSuccess();

      await mobileAuthService.reEnrollBiometrics();

      // Should have cleared old data first
      expect(mockSecureStorage.clearBiometricEnrollmentId).toHaveBeenCalled();
      expect(mockSecureStorage.setBiometricEnabled).toHaveBeenCalledWith(false);

      // Then set new data
      expect(mockSecureStorage.setBiometricEnabled).toHaveBeenCalledWith(true);
      expect(mockSecureStorage.saveBiometricEnrollmentId).toHaveBeenCalled();

      // Verify a new enrollment id was saved
      const savedId = mockSecureStorage.saveBiometricEnrollmentId.mock.calls[0][0];
      expect(savedId).toBeTruthy();
    });

    it('should throw when biometrics are not available', async () => {
      setupBiometricUnavailable();

      await expect(mobileAuthService.reEnrollBiometrics()).rejects.toThrow(
        'Biometric authentication is not available on this device.'
      );

      // Should not have saved any enrollment id
      expect(mockSecureStorage.saveBiometricEnrollmentId).not.toHaveBeenCalled();
    });

    it('should throw when biometric auth fails', async () => {
      setupBiometricAvailable();
      setupAuthFailure();

      await expect(mobileAuthService.reEnrollBiometrics()).rejects.toThrow(
        'Biometric authentication was cancelled or failed.'
      );

      // Should have cleared old data but not saved new data
      expect(mockSecureStorage.clearBiometricEnrollmentId).toHaveBeenCalled();
      expect(mockSecureStorage.saveBiometricEnrollmentId).not.toHaveBeenCalled();
    });

    it('should clear old enrollment id before prompting', async () => {
      setupBiometricAvailable();
      setupAuthSuccess();

      await mobileAuthService.reEnrollBiometrics();

      // Verify clear was called before authenticate
      const clearCallOrder = mockSecureStorage.clearBiometricEnrollmentId.mock.invocationCallOrder[0];
      const authCallOrder = mockLocalAuth.authenticateAsync.mock.invocationCallOrder[0];
      expect(clearCallOrder).toBeLessThan(authCallOrder);
    });

    it('should save new enrollment id after successful auth', async () => {
      setupBiometricAvailable();
      setupAuthSuccess();

      await mobileAuthService.reEnrollBiometrics();

      // Verify save was called after authenticate
      const authCallOrder = mockLocalAuth.authenticateAsync.mock.invocationCallOrder[0];
      const saveCallOrder = mockSecureStorage.saveBiometricEnrollmentId.mock.invocationCallOrder[0];
      expect(authCallOrder).toBeLessThan(saveCallOrder);
    });
  });

  // ── Integration: enable → login → re-enroll flow ──────────────────────────

  describe('Integration: enable → login → re-enroll flow', () => {
    it('should complete the full biometric lifecycle', async () => {
      // Step 1: Enable biometrics
      setupBiometricAvailable();
      setupAuthSuccess();

      await mobileAuthService.enableBiometrics();

      expect(mockSecureStorage.setBiometricEnabled).toHaveBeenCalledWith(true);
      const enrollmentId = mockSecureStorage.saveBiometricEnrollmentId.mock.calls[0][0];
      expect(enrollmentId).toBeTruthy();

      // Step 2: Login with biometrics (should succeed)
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue(enrollmentId);
      setupValidSession();

      const result = await mobileAuthService.loginWithBiometrics();
      expect(result).toEqual(MOCK_AUTH_RESULT);

      // Step 3: Simulate enrollment change (enrollment id becomes invalid)
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue(null);

      // Step 4: Login should now require re-enrollment
      await expect(mobileAuthService.loginWithBiometrics()).rejects.toThrow(
        BiometricReenrollmentError
      );

      // Step 5: Re-enroll
      await mobileAuthService.reEnrollBiometrics();

      const newEnrollmentId = mockSecureStorage.saveBiometricEnrollmentId.mock.calls[1][0];
      expect(newEnrollmentId).not.toBe(enrollmentId);

      // Step 6: Login should succeed again
      mockSecureStorage.getBiometricEnrollmentId.mockResolvedValue(newEnrollmentId);

      const result2 = await mobileAuthService.loginWithBiometrics();
      expect(result2).toEqual(MOCK_AUTH_RESULT);
    });
  });

  describe('isValidBiometricType', () => {
    it.each(VALID_BIOMETRIC_TYPES)('should accept the valid biometric type "%s"', (type) => {
      expect(isValidBiometricType(type)).toBe(true);
    });

    it.each([
      'retina',
      'voice',
      'Fingerprint',
      '',
      ' ',
      'fingerprint ',
    ])('should reject the invalid string "%s"', (value) => {
      expect(isValidBiometricType(value)).toBe(false);
    });

    it.each([null, undefined, 1, true, {}, [], Symbol('face')])(
      'should reject the non-string value %p',
      (value) => {
        expect(isValidBiometricType(value)).toBe(false);
      }
    );
  });
});

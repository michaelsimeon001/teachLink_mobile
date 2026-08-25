import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  isBiometricEnrolled,
  authenticateWithBiometrics,
} from '../services/biometricAuth';
import {
  isBiometricEnabled,
  setBiometricEnabled,
} from '../services/secureStorage';
import { useDeviceStore } from '../store/deviceStore';

interface UseBiometricAuthReturn {
  isAvailable: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  enable: () => Promise<boolean>;
  disable: () => Promise<void>;
  authenticate: (promptMessage?: string) => Promise<boolean>;
}

export const useBiometricAuth = (): UseBiometricAuthReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const isDeviceCompromised = useDeviceStore(s => s.isDeviceCompromised);
  const biometricEnabled = useDeviceStore(s => s.biometricEnabled);
  const setBiometricEnabledStore = useDeviceStore(s => s.setBiometricEnabled);

  // Sync biometric state from SecureStore on mount and on foreground
  const syncFromSecureStore = useCallback(async () => {
    try {
      const enabled = await isBiometricEnabled();
      if (!isMountedRef.current) return;
      setBiometricEnabledStore(enabled);
      if (isDeviceCompromised && enabled) {
        setBiometricEnabledStore(false);
        setError('Biometric login is disabled because your device appears to be compromised.');
      } else {
        setError(null);
      }
    } catch {
      // Ignore sync errors
    }
  }, [isDeviceCompromised, setBiometricEnabledStore]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        await syncFromSecureStore();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncFromSecureStore();
      }
    });

    return () => {
      cancelled = true;
      isMountedRef.current = false;
      subscription.remove();
    };
  }, [syncFromSecureStore]);

  const enable = useCallback(async (): Promise<boolean> => {
    try {
      const enrolled = await isBiometricEnrolled();
      if (!enrolled) {
        setError('No biometric credentials enrolled on this device.');
        return false;
      }
      await setBiometricEnabled(true);
      setBiometricEnabledStore(true);
      setError(null);
      return true;
    } catch {
      setError('Failed to enable biometric login.');
      return false;
    }
  }, [setBiometricEnabledStore]);

  const disable = useCallback(async (): Promise<void> => {
    await setBiometricEnabled(false);
    setBiometricEnabledStore(false);
    setError(null);
  }, [setBiometricEnabledStore]);

  const authenticate = useCallback(
    async (promptMessage = 'Authenticate to continue'): Promise<boolean> => {
      if (isDeviceCompromised) return false;
      try {
        const result = await authenticateWithBiometrics(promptMessage);
        return result.success;
      } catch {
        return false;
      }
    },
    [isDeviceCompromised]
  );

  const isAvailable = !isDeviceCompromised;
  const isEnabled = !isDeviceCompromised && biometricEnabled;

  return {
    isAvailable,
    isEnabled,
    isLoading,
    error,
    enable,
    disable,
    authenticate,
  };
};

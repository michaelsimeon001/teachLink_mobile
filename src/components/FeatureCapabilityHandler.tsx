import { useEffect } from 'react';
import { featureCapabilities, FeatureType } from '../services/featureCapabilities';
import { useGuardedDegradationStore } from '../store/degradationStore';
import { appLogger } from '../utils/logger';

const FeatureCapabilityHandler = () => {
  const degradationStore = useGuardedDegradationStore();

  useEffect(() => {
    const checkCapabilities = async () => {
      try {
        const capabilities = await featureCapabilities.checkAllCapabilities();
        appLogger.infoSync('[App] Feature capabilities checked', {
          camera: capabilities.camera.status,
          notifications: capabilities.pushNotifications.status,
          location: capabilities.location.status,
        });
        // Update degradation store with current feature statuses
        Object.entries(capabilities).forEach(([feature, info]) => {
          if (feature !== 'checkedAt' && 'status' in info) {
            if ((Object.values(FeatureType) as string[]).includes(feature)) {
              degradationStore.setFeatureStatus(feature as FeatureType, info.status);
            }
          }
        });
      } catch (error) {
        appLogger.errorSync(
          '[App] Error checking feature capabilities',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    };

    checkCapabilities();
  }, [degradationStore]);

  return null;
};

export default FeatureCapabilityHandler;

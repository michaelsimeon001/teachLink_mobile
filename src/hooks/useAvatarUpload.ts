import { useCallback, useRef, useState } from 'react';
import * as FileSystem from 'expo-file-system';

import apiClient from '../services/api/axios.config';
import { appLogger } from '../utils/logger';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export interface AvatarUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useAvatarUpload(userId: string) {
  const [state, setState] = useState<AvatarUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadAvatar = useCallback(
    async (imageUri: string): Promise<string | null> => {
      setState({ isUploading: true, progress: 0, error: null });

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          abortControllerRef.current = new AbortController();

          const formData = new FormData();
          const filename = imageUri.split('/').pop() || 'avatar.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          formData.append('avatar', {
            uri: imageUri,
            name: filename,
            type,
          } as any);

          const response = await apiClient.post<{ avatarUrl: string }>(
            `/users/${userId}/avatar`,
            formData,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
              signal: abortControllerRef.current.signal,
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setState(prev => ({ ...prev, progress: percent }));
                }
              },
            }
          );

          setState({ isUploading: false, progress: 100, error: null });
          return response.data.avatarUrl;
        } catch (error: any) {
          if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
            setState({ isUploading: false, progress: 0, error: 'Upload cancelled' });
            return null;
          }

          const isLastAttempt = attempt === MAX_RETRIES;
          if (isLastAttempt) {
            const message = error?.response?.data?.message || 'Avatar upload failed';
            setState({ isUploading: false, progress: 0, error: message });
            appLogger.error('Avatar upload failed after retries:', error);
            return null;
          }

          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          appLogger.warn(`Avatar upload attempt ${attempt} failed, retrying in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      return null;
    },
    [userId]
  );

  const cancelUpload = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const resetState = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null });
  }, []);

  return { ...state, uploadAvatar, cancelUpload, resetState };
}

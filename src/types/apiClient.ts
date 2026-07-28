// src/types/apiClient.ts
// Typed interface that RequestQueue uses to replay queued requests.
// The exported `apiClient` from axios.config.ts satisfies this interface.

import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * Minimum contract required by RequestQueue to execute queued HTTP requests.
 *
 * Typed as a callable (for replaying raw configs) plus named method overloads
 * so TypeScript can verify the actual apiClient satisfies it at compile time.
 */
export interface ApiClient {
  (config: InternalAxiosRequestConfig): Promise<AxiosResponse>;
  get<T = unknown>(url: string, config?: object): Promise<AxiosResponse<T>>;
  post<T = unknown>(url: string, data?: unknown, config?: object): Promise<AxiosResponse<T>>;
  put<T = unknown>(url: string, data?: unknown, config?: object): Promise<AxiosResponse<T>>;
  patch<T = unknown>(url: string, data?: unknown, config?: object): Promise<AxiosResponse<T>>;
  delete<T = unknown>(url: string, config?: object): Promise<AxiosResponse<T>>;
}

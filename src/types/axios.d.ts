// src/types/axios.d.ts
// Module augmentation for custom Axios request config properties.
// This is the single source of truth — no more `as any` casts needed.

import 'axios';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    /**
     * Set to `true` once a 401 has triggered a token-refresh attempt for this
     * request, preventing infinite refresh loops.
     */
    _retry?: boolean;

    /**
     * Running count of retry attempts for 429 (rate-limit) and 5xx (server
     * error) responses. Starts at 0 and increments before each retry.
     */
    _retryCount?: number;

    /**
     * Epoch milliseconds recorded when the request was dispatched. Used to
     * calculate response latency in the response interceptor.
     */
    _requestStartMs?: number;

    /**
     * Performance timing finish callback injected by the request interceptor.
     * Set to `undefined` after first use to avoid double-reporting on retries.
     */
    _timingFinish?: ((success: boolean, statusCode?: number) => unknown) | undefined;
  }
}

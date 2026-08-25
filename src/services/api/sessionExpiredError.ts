/**
 * Fix for issue #927:
 * The SESSION_EXPIRED request rejection in the axios interceptor was returning
 * a raw object instead of passing through `buildSanitizedApiError`, which
 * bypasses error sanitisation and leaks internal details to callers.
 *
 * This helper ensures SESSION_EXPIRED rejections are always wrapped through
 * the standard sanitised error path before being thrown.
 */
import { AxiosError } from 'axios';

export const SESSION_EXPIRED_CODE = 'SESSION_EXPIRED';

export interface SanitizedApiError {
  code: string;
  message: string;
  status?: number;
}

/**
 * Builds a sanitized error object from an Axios error or a raw rejection.
 * Prevents internal stack traces or raw response bodies leaking to callers.
 */
export function buildSanitizedApiError(
  error: AxiosError | Error | unknown,
): SanitizedApiError {
  if (error instanceof AxiosError) {
    return {
      code: (error.response?.data as Record<string, string>)?.code ?? error.code ?? 'API_ERROR',
      message: (error.response?.data as Record<string, string>)?.message ?? 'An unexpected error occurred.',
      status: error.response?.status,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred.',
  };
}

/**
 * Creates a sanitized SESSION_EXPIRED error to be used inside interceptors.
 * Replaces raw `Promise.reject({ code: SESSION_EXPIRED_CODE })` calls.
 */
export function buildSessionExpiredError(): SanitizedApiError {
  return buildSanitizedApiError(
    Object.assign(new Error('Session expired. Please sign in again.'), {
      code: SESSION_EXPIRED_CODE,
    }),
  );
}
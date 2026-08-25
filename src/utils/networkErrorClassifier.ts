/**
 * Fix for issue #783:
 * CORS failures and generic network errors both arrive as Axios errors with
 * no `response` (status 0 / Network Error). The interceptors treated them
 * identically, making CORS policy violations invisible in logs and to callers.
 *
 * This utility distinguishes CORS failures from plain network errors so they
 * can be logged and surfaced separately for easier diagnosis.
 */
import { AxiosError } from 'axios';

export type NetworkFailureKind = 'cors' | 'network' | 'timeout' | 'other';

/**
 * Classifies an Axios error that has no response (status 0) into a more
 * specific failure kind so callers and loggers can act appropriately.
 */
export function classifyNetworkError(error: AxiosError): NetworkFailureKind {
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') {
    return 'timeout';
  }

  // Axios surfaces CORS failures as a Network Error with no response.
  // Detect them by the presence of a request but absence of a response.
  if (error.request && !error.response) {
    const isCorsLikely =
      typeof error.message === 'string' &&
      (error.message.toLowerCase().includes('network error') ||
        error.message.toLowerCase().includes('cors'));

    return isCorsLikely ? 'cors' : 'network';
  }

  return 'other';
}

/**
 * Returns a user-friendly message for the given network failure kind.
 */
export function networkErrorMessage(kind: NetworkFailureKind): string {
  switch (kind) {
    case 'cors':
      return 'Request blocked by CORS policy. Check API origin configuration.';
    case 'timeout':
      return 'The request timed out. Please try again.';
    case 'network':
      return 'A network error occurred. Check your connection.';
    default:
      return 'An unexpected error occurred.';
  }
}
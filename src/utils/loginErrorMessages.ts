/**
 * Login failure message mapping. (#798)
 *
 * Login returned "Login failed. Please try again." for every failure, so a
 * suspended account, a wrong password and a dropped connection read
 * identically and the user could not tell which action would help. Each
 * cause gets its own actionable message.
 */

export interface LoginFailure {
  status?: number;
  code?: string;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Please check the details you entered and try again.',
  401: 'Incorrect email or password.',
  403: 'This account is suspended. Please contact support.',
  404: 'No account exists for that email address.',
  429: 'Too many attempts. Please wait a minute and try again.',
  500: 'We could not reach the server. Please try again shortly.',
  503: 'Sign-in is temporarily unavailable. Please try again shortly.',
};

const NETWORK_CODES = new Set(['ECONNABORTED', 'ERR_NETWORK', 'ETIMEDOUT']);
const NETWORK_MESSAGE = 'Check your internet connection and try again.';
const FALLBACK_MESSAGE = 'We could not sign you in. Please try again.';

/**
 * Maps a login failure onto a specific, actionable message.
 * A missing or zero status means the request never reached the server.
 */
export function getLoginErrorMessage(error: LoginFailure): string {
  if (error.code && NETWORK_CODES.has(error.code)) return NETWORK_MESSAGE;
  if (error.status === undefined || error.status === 0) return NETWORK_MESSAGE;
  return STATUS_MESSAGES[error.status] ?? FALLBACK_MESSAGE;
}

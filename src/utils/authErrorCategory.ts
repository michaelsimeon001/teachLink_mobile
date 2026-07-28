/**
 * Auth error categorisation. (#791)
 *
 * Every auth failure went through one message lookup, so a dropped connection
 * and a locked account produced the same text and the same recovery action.
 * Callers use the category to pick the right affordance.
 */
export enum AuthErrorCategory {
  NETWORK = 'NETWORK',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNKNOWN = 'UNKNOWN',
}

export type AuthRecoveryAction = 'retry' | 'reenterCredentials' | 'contactSupport' | 'signIn';
const RECOVERY_ACTIONS: Record<AuthErrorCategory, AuthRecoveryAction> = {
  [AuthErrorCategory.NETWORK]: 'retry',
  [AuthErrorCategory.INVALID_CREDENTIALS]: 'reenterCredentials',
  [AuthErrorCategory.ACCOUNT_LOCKED]: 'contactSupport',
  [AuthErrorCategory.SESSION_EXPIRED]: 'signIn',
  [AuthErrorCategory.UNKNOWN]: 'retry',
};
const NETWORK_CODES = new Set(['ECONNABORTED', 'ERR_NETWORK', 'ETIMEDOUT']);
export interface CategorisableAuthError {
  status?: number;
  code?: string;
}
/** Maps a transport or auth failure onto a category. */
export function categoriseAuthError(error: CategorisableAuthError): AuthErrorCategory {
  if ((error.code && NETWORK_CODES.has(error.code)) || error.status === 0) {
    return AuthErrorCategory.NETWORK;
  }
  switch (error.status) {
    case 401:
      return AuthErrorCategory.INVALID_CREDENTIALS;
    case 403:
      return AuthErrorCategory.ACCOUNT_LOCKED;
    case 419:
    case 440:
      return AuthErrorCategory.SESSION_EXPIRED;
    default:
      return AuthErrorCategory.UNKNOWN;
  }
}

/** The recovery affordance the UI should offer for a category. */
export function getRecoveryAction(category: AuthErrorCategory): AuthRecoveryAction {
  return RECOVERY_ACTIONS[category];
}

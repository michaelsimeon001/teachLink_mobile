import { ValidationResult } from '../utils/validation';

export const ENV_VARIABLES = {
  EXPO_PUBLIC_API_BASE_URL: { required: true },
  EXPO_PUBLIC_SOCKET_URL: { required: true },
  EXPO_PUBLIC_APP_ENV: { required: false },
  EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: { required: false },
  EXPO_PUBLIC_STORYBOOK: { required: false },
  EXPO_PUBLIC_SENTRY_ENABLED: { required: false },
  EXPO_PUBLIC_SENTRY_DSN: { required: false },
  EXPO_PUBLIC_LAZY_LOAD_DELAY_MS: { required: false },
} as const;

export type EnvVariable = keyof typeof ENV_VARIABLES;

export interface EnvConfig {
  EXPO_PUBLIC_API_BASE_URL: string;
  EXPO_PUBLIC_SOCKET_URL: string;
  EXPO_PUBLIC_APP_ENV?: 'development' | 'production';
  EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS?: 'true' | 'false';
  EXPO_PUBLIC_STORYBOOK?: 'true' | 'false';
  EXPO_PUBLIC_SENTRY_ENABLED?: 'true' | 'false';
  EXPO_PUBLIC_SENTRY_DSN?: string;
  EXPO_PUBLIC_LAZY_LOAD_DELAY_MS?: string;
}

export const REQUIRED_VARIABLES = (Object.keys(ENV_VARIABLES) as EnvVariable[]).filter(
  variable => ENV_VARIABLES[variable].required
);

export function validateEnvVariables(): ValidationResult {
  const missing: string[] = [];
  const errors: string[] = [];

  for (const variable of REQUIRED_VARIABLES) {
    const value = process.env[variable];

    if (!value || value.trim() === '') {
      missing.push(variable);
      errors.push(
        `Missing required environment variable: ${variable}. ` +
          `Please set ${variable} in your .env file. See .env.example for reference.`
      );
      continue;
    }

    if (variable === 'EXPO_PUBLIC_API_BASE_URL') {
      try {
        const url = new URL(value);
        if (url.protocol !== 'https:') {
          errors.push(
            `Invalid URL for ${variable}: ${value}. ` +
              `EXPO_PUBLIC_API_BASE_URL must use https://.`
          );
        }
      } catch {
        errors.push(
          `Invalid URL for ${variable}: ${value}. ` + `Please provide a valid https:// URL.`
        );
      }
    }

    if (variable === 'EXPO_PUBLIC_SOCKET_URL') {
      if (!value.startsWith('ws://') && !value.startsWith('wss://')) {
        errors.push(
          `Invalid WebSocket URL for ${variable}: ${value}. ` +
            `Please provide a valid ws:// or wss:// URL.`
        );
      }
    }
  }

  if (process.env.EXPO_PUBLIC_APP_ENV) {
    const envValue = process.env.EXPO_PUBLIC_APP_ENV;
    if (envValue !== 'development' && envValue !== 'production') {
      errors.push(
        `Invalid value for EXPO_PUBLIC_APP_ENV: ${envValue}. ` +
          `Allowed values are 'development' or 'production'.`
      );
    }
  }

  if (process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS) {
    const pushValue = process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS;
    if (pushValue !== 'true' && pushValue !== 'false') {
      errors.push(
        `Invalid value for EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: ${pushValue}. ` +
          `Allowed values are 'true' or 'false'.`
      );
    }
  }

  if (process.env.EXPO_PUBLIC_STORYBOOK) {
    const storyValue = process.env.EXPO_PUBLIC_STORYBOOK;
    if (storyValue !== 'true' && storyValue !== 'false') {
      errors.push(
        `Invalid value for EXPO_PUBLIC_STORYBOOK: ${storyValue}. ` +
          `Allowed values are 'true' or 'false'.`
      );
    }
  }

  if (process.env.EXPO_PUBLIC_SENTRY_ENABLED) {
    const sentryValue = process.env.EXPO_PUBLIC_SENTRY_ENABLED;
    if (sentryValue !== 'true' && sentryValue !== 'false') {
      errors.push(
        `Invalid value for EXPO_PUBLIC_SENTRY_ENABLED: ${sentryValue}. ` +
          `Allowed values are 'true' or 'false'.`
      );
    }
  }

  if (process.env.EXPO_PUBLIC_SENTRY_ENABLED === 'true' && !process.env.EXPO_PUBLIC_SENTRY_DSN) {
    errors.push(
      'EXPO_PUBLIC_SENTRY_DSN is required when EXPO_PUBLIC_SENTRY_ENABLED is true.'
    );
  }

  return {
    valid: missing.length === 0 && errors.length === 0,
    message: errors.length > 0 ? errors.join(' ') : undefined,
  };
}

export function requireEnvVariables(): EnvConfig {
  const validation = validateEnvVariables();

  if (!validation.valid) {
    throw new Error(
      `Environment Configuration Error: ${validation.message ?? 'Invalid .env values.'}`
    );
  }

  return {
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL!,
    EXPO_PUBLIC_SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL!,
    EXPO_PUBLIC_APP_ENV:
      process.env.EXPO_PUBLIC_APP_ENV === 'production' ? 'production' : 'development',
    EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS,
    EXPO_PUBLIC_STORYBOOK: process.env.EXPO_PUBLIC_STORYBOOK,
    EXPO_PUBLIC_SENTRY_ENABLED: process.env.EXPO_PUBLIC_SENTRY_ENABLED as 'true' | 'false' | undefined,
    EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    EXPO_PUBLIC_LAZY_LOAD_DELAY_MS: process.env.EXPO_PUBLIC_LAZY_LOAD_DELAY_MS,
  };
}

export function getEnv(variable: keyof EnvConfig): string {
  const value = process.env[variable];

  if (!value) {
    throw new Error(
      `Environment variable ${variable} is not set. Call requireEnvVariables() at app startup.`
    );
  }
  return value;
}

import { validateEnvVariables, requireEnvVariables, getEnv } from '../config/env';

const ENV_KEYS = [
  'EXPO_PUBLIC_API_BASE_URL',
  'EXPO_PUBLIC_SOCKET_URL',
  'EXPO_PUBLIC_APP_ENV',
  'EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS',
  'EXPO_PUBLIC_STORYBOOK',
  'EXPO_PUBLIC_SENTRY_ENABLED',
];

const savedValues: Record<string, string | undefined> = {};

function setEnv(vars: Record<string, string | undefined>) {
  for (const key of ENV_KEYS) {
    savedValues[key] = process.env[key];
    if (key in vars) {
      if (vars[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = vars[key];
      }
    }
  }
}

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedValues[key] !== undefined) {
      process.env[key] = savedValues[key];
    } else {
      delete process.env[key];
    }
  }
});

describe('validateEnvVariables', () => {
  it('returns valid when all required vars are present with correct formats', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
      EXPO_PUBLIC_APP_ENV: undefined,
      EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: undefined,
      EXPO_PUBLIC_STORYBOOK: undefined,
      EXPO_PUBLIC_SENTRY_ENABLED: undefined,
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it('returns invalid when EXPO_PUBLIC_API_BASE_URL is missing', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: undefined,
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(false);
    expect(result.message).toContain('EXPO_PUBLIC_API_BASE_URL');
  });

  it('returns invalid when EXPO_PUBLIC_API_BASE_URL is not https', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'http://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(false);
    expect(result.message).toContain('must use https://');
  });

  it('returns invalid for completely malformed EXPO_PUBLIC_API_BASE_URL', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'not-a-url',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Invalid URL');
  });

  it('returns invalid when EXPO_PUBLIC_SOCKET_URL is missing', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: undefined,
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(false);
    expect(result.message).toContain('EXPO_PUBLIC_SOCKET_URL');
  });

  it('returns invalid when EXPO_PUBLIC_SOCKET_URL is not ws:// or wss://', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'http://socket.example.com',
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(false);
    expect(result.message).toContain('ws:// or wss://');
  });

  it('returns valid when EXPO_PUBLIC_SOCKET_URL uses ws://', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'ws://socket.example.com',
      EXPO_PUBLIC_APP_ENV: undefined,
      EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: undefined,
      EXPO_PUBLIC_STORYBOOK: undefined,
      EXPO_PUBLIC_SENTRY_ENABLED: undefined,
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(true);
  });

  it('returns valid when optional EXPO_PUBLIC_APP_ENV is absent', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
      EXPO_PUBLIC_APP_ENV: undefined,
      EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: undefined,
      EXPO_PUBLIC_STORYBOOK: undefined,
      EXPO_PUBLIC_SENTRY_ENABLED: undefined,
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(true);
  });

  it('returns invalid when EXPO_PUBLIC_APP_ENV has invalid value', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
      EXPO_PUBLIC_APP_ENV: 'staging',
      EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: undefined,
      EXPO_PUBLIC_STORYBOOK: undefined,
      EXPO_PUBLIC_SENTRY_ENABLED: undefined,
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(false);
    expect(result.message).toContain('EXPO_PUBLIC_APP_ENV');
  });

  it('returns valid when EXPO_PUBLIC_APP_ENV is development', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
      EXPO_PUBLIC_APP_ENV: 'development',
      EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: undefined,
      EXPO_PUBLIC_STORYBOOK: undefined,
      EXPO_PUBLIC_SENTRY_ENABLED: undefined,
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(true);
  });

  it('returns invalid when EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS is invalid', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
      EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: 'yes',
      EXPO_PUBLIC_STORYBOOK: undefined,
      EXPO_PUBLIC_SENTRY_ENABLED: undefined,
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(false);
    expect(result.message).toContain('EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS');
  });

  it('returns invalid when EXPO_PUBLIC_STORYBOOK has invalid value', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
      EXPO_PUBLIC_STORYBOOK: 'maybe',
      EXPO_PUBLIC_SENTRY_ENABLED: undefined,
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(false);
    expect(result.message).toContain('EXPO_PUBLIC_STORYBOOK');
  });

  it('returns invalid when EXPO_PUBLIC_SENTRY_ENABLED has invalid value', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
      EXPO_PUBLIC_SENTRY_ENABLED: 'on',
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(false);
    expect(result.message).toContain('EXPO_PUBLIC_SENTRY_ENABLED');
  });

  it('returns invalid for both missing required vars', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: undefined,
      EXPO_PUBLIC_SOCKET_URL: undefined,
    });

    const result = validateEnvVariables();
    expect(result.valid).toBe(false);
    expect(result.message).toContain('EXPO_PUBLIC_API_BASE_URL');
    expect(result.message).toContain('EXPO_PUBLIC_SOCKET_URL');
  });
});

describe('requireEnvVariables', () => {
  it('returns config object when all required vars are valid', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
      EXPO_PUBLIC_APP_ENV: undefined,
    });

    const config = requireEnvVariables();
    expect(config.EXPO_PUBLIC_API_BASE_URL).toBe('https://api.example.com');
    expect(config.EXPO_PUBLIC_SOCKET_URL).toBe('wss://socket.example.com');
  });

  it('throws when required vars are missing', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: undefined,
      EXPO_PUBLIC_SOCKET_URL: undefined,
    });

    expect(() => requireEnvVariables()).toThrow('Environment Configuration Error');
  });

  it('throws when URL formats are invalid', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'http://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'not-ws',
    });

    expect(() => requireEnvVariables()).toThrow('Environment Configuration Error');
  });

  it('defaults EXPO_PUBLIC_APP_ENV to development when not production', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
      EXPO_PUBLIC_APP_ENV: undefined,
    });

    const config = requireEnvVariables();
    expect(config.EXPO_PUBLIC_APP_ENV).toBe('development');
  });

  it('sets EXPO_PUBLIC_APP_ENV to production when explicitly set', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
      EXPO_PUBLIC_APP_ENV: 'production',
    });

    const config = requireEnvVariables();
    expect(config.EXPO_PUBLIC_APP_ENV).toBe('production');
  });
});

describe('getEnv', () => {
  it('returns value for EXPO_PUBLIC_API_BASE_URL', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
    });

    expect(getEnv('EXPO_PUBLIC_API_BASE_URL')).toBe('https://api.example.com');
  });

  it('returns value for EXPO_PUBLIC_SOCKET_URL', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
    });

    expect(getEnv('EXPO_PUBLIC_SOCKET_URL')).toBe('wss://socket.example.com');
  });

  it('throws when EXPO_PUBLIC_API_BASE_URL is missing', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: undefined,
      EXPO_PUBLIC_SOCKET_URL: 'wss://socket.example.com',
    });

    expect(() => getEnv('EXPO_PUBLIC_API_BASE_URL')).toThrow(
      'Environment variable EXPO_PUBLIC_API_BASE_URL is not set'
    );
  });

  it('throws when EXPO_PUBLIC_SOCKET_URL is missing', () => {
    setEnv({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
      EXPO_PUBLIC_SOCKET_URL: undefined,
    });

    expect(() => getEnv('EXPO_PUBLIC_SOCKET_URL')).toThrow(
      'Environment variable EXPO_PUBLIC_SOCKET_URL is not set'
    );
  });
});

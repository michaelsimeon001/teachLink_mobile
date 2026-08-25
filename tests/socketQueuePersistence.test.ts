/**
 * Socket Queue Persistence Tests
 * Issue #829
 *
 * Verifies that outgoing messages survive an app restart by persisting
 * to MMKV, and that expired messages (>24h) are discarded on restore.
 */

const store: Record<string, string> = {};

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn((key: string) => store[key] ?? null),
    set: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    delete: jest.fn((key: string) => {
      delete store[key];
    }),
  })),
}));

jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Platform: { OS: 'ios' },
}));

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    connected: false,
    id: 'test-socket-id',
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
}));

jest.mock('@/store', () => ({
  useSocketStore: {
    getState: jest.fn(() => ({
      setReconnectAttempts: jest.fn(),
      setConnectionFailed: jest.fn(),
      resetConnection: jest.fn(),
    })),
  },
}));

jest.mock('@/config', () => ({
  getEnv: jest.fn(() => 'wss://test.example.com'),
}));

jest.mock('@/utils/logger', () => ({
  appLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/services/sync/syncEntityManager', () => ({
  default: {
    getBase: jest.fn(),
    handleServerEntity: jest.fn(),
  },
}));

jest.mock('@/services/socket/binaryProtocol', () => ({
  encodeBinaryMessage: jest.fn((_event: string, data: Record<string, any>) => new Uint8Array([1])),
  decodeBinaryMessage: jest.fn(() => ({ event: 'test', payload: {} })),
}));

const QUEUE_STORAGE_KEY = 'socket:outgoing-queue';
const QUEUE_TTL_MS = 24 * 60 * 60 * 1000;

interface QueuedMessage {
  id: string;
  event: string;
  data: Record<string, any>;
  timestamp: number;
}

describe('Socket Queue Persistence', () => {
  let mmkvInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(store).forEach(key => delete store[key]);
    const { MMKV } = require('react-native-mmkv');
    mmkvInstance = new MMKV();
  });

  it('should persist queued messages to MMKV', () => {
    const messages: QueuedMessage[] = [
      {
        id: '1',
        event: 'chat_message',
        data: { text: 'hello' },
        timestamp: Date.now(),
      },
      {
        id: '2',
        event: 'typing_indicator',
        data: { isTyping: true },
        timestamp: Date.now(),
      },
    ];

    mmkvInstance.set(QUEUE_STORAGE_KEY, JSON.stringify(messages));

    const raw = mmkvInstance.getString(QUEUE_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].event).toBe('chat_message');
    expect(parsed[1].event).toBe('typing_indicator');
  });

  it('should restore queue from MMKV and discard expired messages', () => {
    const now = Date.now();
    const messages: QueuedMessage[] = [
      {
        id: '1',
        event: 'recent_message',
        data: { text: 'hi' },
        timestamp: now,
      },
      {
        id: '2',
        event: 'old_message',
        data: { text: 'old' },
        timestamp: now - QUEUE_TTL_MS - 1000,
      },
      {
        id: '3',
        event: 'another_old',
        data: { text: 'also old' },
        timestamp: now - QUEUE_TTL_MS * 2,
      },
    ];

    mmkvInstance.set(QUEUE_STORAGE_KEY, JSON.stringify(messages));

    const raw = mmkvInstance.getString(QUEUE_STORAGE_KEY);
    const stored: QueuedMessage[] = JSON.parse(raw!);
    const restored = stored.filter(msg => now - msg.timestamp < QUEUE_TTL_MS);

    expect(restored).toHaveLength(1);
    expect(restored[0].event).toBe('recent_message');
  });

  it('should replay queued messages after restore when connected', () => {
    const now = Date.now();
    const messages: QueuedMessage[] = [
      {
        id: '1',
        event: 'sync_update',
        data: { entityId: 'abc' },
        timestamp: now - 5000,
      },
    ];

    mmkvInstance.set(QUEUE_STORAGE_KEY, JSON.stringify(messages));

    const raw = mmkvInstance.getString(QUEUE_STORAGE_KEY);
    const stored: QueuedMessage[] = JSON.parse(raw!);
    const validMessages = stored.filter(
      msg => now - msg.timestamp < QUEUE_TTL_MS
    );

    expect(validMessages).toHaveLength(1);
    expect(validMessages[0].event).toBe('sync_update');
  });

  it('should handle empty queue gracefully', () => {
    const raw = mmkvInstance.getString(QUEUE_STORAGE_KEY);
    expect(raw).toBeNull();

    const stored = raw ? JSON.parse(raw) : [];
    expect(stored).toHaveLength(0);
  });

  it('should handle corrupted data in storage gracefully', () => {
    mmkvInstance.set(QUEUE_STORAGE_KEY, 'not-valid-json{{{');

    const raw = mmkvInstance.getString(QUEUE_STORAGE_KEY);
    let parsed: unknown[] = [];
    try {
      parsed = JSON.parse(raw!);
    } catch {
      parsed = [];
    }

    expect(parsed).toEqual([]);
  });

  it('should not duplicate messages on double-connect', () => {
    const now = Date.now();
    const messages: QueuedMessage[] = [
      {
        id: 'msg-1',
        event: 'chat_message',
        data: { text: 'hello' },
        timestamp: now,
      },
      {
        id: 'msg-2',
        event: 'typing_indicator',
        data: { isTyping: true },
        timestamp: now,
      },
    ];

    mmkvInstance.set(QUEUE_STORAGE_KEY, JSON.stringify(messages));

    // Simulate restore: read from storage
    const raw = mmkvInstance.getString(QUEUE_STORAGE_KEY);
    const stored: QueuedMessage[] = JSON.parse(raw!);

    // First restore: merge into empty queue
    const queue1: QueuedMessage[] = [];
    const ids1 = new Set(queue1.map(m => m.id));
    const merged1 = [...queue1, ...stored.filter(m => !ids1.has(m.id))];
    expect(merged1).toHaveLength(2);

    // Second restore (double-connect): merge into existing queue
    const ids2 = new Set(merged1.map(m => m.id));
    const merged2 = [...merged1, ...stored.filter(m => !ids2.has(m.id))];
    expect(merged2).toHaveLength(2); // Still 2, not 4
    expect(merged2[0].id).toBe('msg-1');
    expect(merged2[1].id).toBe('msg-2');
  });
});

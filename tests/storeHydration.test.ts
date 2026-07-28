import { StateCreator } from 'zustand';

import { createStore } from '../src/store/createStore';

const mmkvStore: Record<string, string> = {};

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: (key: string) => mmkvStore[key] ?? null,
    set: (key: string, value: string) => {
      mmkvStore[key] = value;
    },
    delete: (key: string) => {
      delete mmkvStore[key];
    },
  })),
}));

jest.mock('../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    errorSync: jest.fn(),
    warnSync: jest.fn(),
  },
}));

jest.mock('zustand/middleware/immer', () => ({
  immer: (fn: StateCreator<any, any, any, any>) => fn,
}));

type CounterState = {
  count: number;
  increment: () => void;
};

function createCounterStore(persistedData?: string) {
  Object.keys(mmkvStore).forEach(k => delete mmkvStore[k]);
  if (persistedData !== undefined) {
    mmkvStore['test-store'] = persistedData;
  }
  return createStore<CounterState>('test-store', set => ({
    count: 0,
    increment: () =>
      set((state: CounterState) => {
        state.count += 1;
      }),
  }));
}

async function flushMicrotasks(count = 20) {
  for (let i = 0; i < count; i++) {
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  }
}

describe('store hydration edge cases (#841)', () => {
  beforeEach(() => {
    Object.keys(mmkvStore).forEach(k => delete mmkvStore[k]);
  });

  it('falls back to default state when storage is empty (fresh install)', async () => {
    const store = createCounterStore();
    await flushMicrotasks();
    expect(store.getState().count).toBe(0);
  });

  it('falls back to default when persisted JSON is missing keys', async () => {
    const store = createCounterStore(JSON.stringify({ state: {}, version: 0 }));
    await flushMicrotasks();
    expect(store.getState().count).toBe(0);
  });

  it('hydrates correctly from valid persisted data', async () => {
    const store = createCounterStore(JSON.stringify({ state: { count: 42 }, version: 0 }));
    await flushMicrotasks();
    expect(store.getState().count).toBe(42);
  });

  it('falls back to default state when storage contains corrupt JSON', async () => {
    const store = createCounterStore('<<<CORRUPT>>>not-json{{{');
    await flushMicrotasks();
    expect(store.getState().count).toBe(0);
  });

  it('handles unknown future version by falling back to default', async () => {
    const store = createCounterStore(JSON.stringify({ state: { count: 7 }, version: 999 }));
    await flushMicrotasks();
    expect(store.getState().count).toBe(0);
  });

  it('handles non-JSON string in storage gracefully', async () => {
    const store = createCounterStore('not-valid-json-at-all');
    await flushMicrotasks();
    expect(store.getState().count).toBe(0);
  });

  it('handles empty string in storage', async () => {
    const store = createCounterStore('');
    await flushMicrotasks();
    expect(store.getState().count).toBe(0);
  });
});

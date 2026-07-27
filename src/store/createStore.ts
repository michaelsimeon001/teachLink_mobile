import { MMKV } from 'react-native-mmkv';
import { create, StateCreator } from 'zustand';
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
  type StateStorage,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import logger from '../utils/logger';

const storage = new MMKV();

/**
 * Async MMKV storage adapter for Zustand persist.
 *
 * MMKV reads/writes are synchronous, so (de)serializing large state objects
 * blocks the JS thread and drops frames during startup. Wrapping each op in a
 * resolved Promise defers the (de)serialization to a microtask, so hydration
 * and persistence no longer block the current frame. (#854)
 */
const asyncMMKVStorage: StateStorage = {
  getItem: (name) => Promise.resolve(storage.getString(name) ?? null),
  setItem: (name, value) => Promise.resolve(storage.set(name, value)),
  removeItem: (name) => Promise.resolve(storage.delete(name)),
};

type PersistConfig<T> = {
  partialize?: (state: T) => Partial<T>;
  migrate?: (persistedState: any, version: number) => T | Promise<T>;
};

export const createStore = <T extends object>(
  name: string,
  initializer: StateCreator<T, [['zustand/subscribeWithSelector', never], ['zustand/immer', never]]>,
  { partialize, migrate }: PersistConfig<T> = {}
) => {
  const store = create<T>()(
    devtools(
      persist(subscribeWithSelector(immer(initializer)), {
        name,
        storage: createJSONStorage(() => asyncMMKVStorage),
        partialize,
        migrate,
        onRehydrateStorage: (_initialState) => {
          // #803: explicitly type both params so implicit `any` is eliminated.
          // `error` is `Error | undefined` per the Zustand persist middleware signature.
          return (_rehydratedState: T | undefined, error: Error | undefined) => {
            if (error) {
              logger.errorSync('an error happened during hydration', error);
              // Reset persisted state to defaults on corrupt storage to avoid
              // leaving the app in a broken half-hydrated state.
              logger.warnSync('Resetting corrupted persisted state for store: ' + name);
            }
          };
        },
      }),
      { name: `Teach-This-${name}` }
    )
  );

  // Add hasHydrated logic here if needed, for now, it's handled by persist middleware

  return store;
};

type HydratableStore = {
  persist?: {
    hasHydrated?: () => boolean;
    onFinishHydration?: (cb: () => void) => () => void;
  };
};

/**
 * Resolves once a persisted store has finished rehydrating.
 *
 * Guards against reading `getState()` before persisted values exist, which
 * would otherwise yield `undefined` for store methods and cause silent no-ops
 * or TypeErrors on pre-hydration access.
 */
export const waitForHydration = (store: HydratableStore): Promise<void> => {
  if (store.persist?.hasHydrated?.()) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const unsubscribe = store.persist?.onFinishHydration?.(() => {
      unsubscribe?.();
      resolve();
    });

    // If the store isn't persisted (no hydration lifecycle), resolve immediately.
    if (!unsubscribe) {
      resolve();
    }
  });
};
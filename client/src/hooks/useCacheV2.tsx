import { useCallback } from "react";

type CacheEntry<T> = {
  value: T;
  expiresAt: number | null;
};

type UseCacheV2Options = {
  ttlMs?: number;
  maxEntries?: number;
};

type UseCacheV2Return<T> = readonly [
  get: (key: string) => T | undefined,
  set: (key: string, value: T) => void,
  remove: (key: string) => void,
  clear: () => void,
];

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const DEFAULT_MAX_ENTRIES = 200;

export const useCacheV2 = <T,>({
  ttlMs = DEFAULT_TTL_MS,
  maxEntries = DEFAULT_MAX_ENTRIES,
}: UseCacheV2Options = {}): UseCacheV2Return<T> => {
  const cacheRef = globalThis as typeof globalThis & {
    __useCacheV2Store?: Map<string, CacheEntry<T>>;
  };
  if (!cacheRef.__useCacheV2Store) {
    cacheRef.__useCacheV2Store = new Map<string, CacheEntry<T>>();
  }
  const store = cacheRef.__useCacheV2Store;

  const purgeExpired = useCallback(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.expiresAt !== null && now > entry.expiresAt) {
        store.delete(key);
      }
    }
  }, [store]);

  const get = useCallback(
    (key: string) => {
      purgeExpired();
      const entry = store.get(key);
      if (!entry) {
        return undefined;
      }

      // Move to the end to keep most recently used entries.
      store.delete(key);
      store.set(key, entry);
      return entry.value;
    },
    [purgeExpired, store],
  );

  const set = useCallback(
    (key: string, value: T) => {
      purgeExpired();

      if (store.has(key)) {
        store.delete(key);
      }

      const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : null;
      store.set(key, { value, expiresAt });

      while (store.size > maxEntries) {
        const oldestKey = store.keys().next().value;
        if (oldestKey === undefined) {
          break;
        }
        store.delete(oldestKey);
      }
    },
    [maxEntries, purgeExpired, store, ttlMs],
  );

  const remove = useCallback(
    (key: string) => {
      store.delete(key);
    },
    [store],
  );

  const clear = useCallback(() => {
    store.clear();
  }, [store]);

  return [get, set, remove, clear] as const;
};

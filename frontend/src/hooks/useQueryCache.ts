import { useCallback } from "react";
import { Item } from "../types";

type CacheEntry = {
  value: Item[];
  expiresAt: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

const now = () => Date.now();

export const useQueryCache = () => {
  const getCached = useCallback((query: string): Item[] | undefined => {
    const entry = cache.get(query);
    if (!entry) {
      return undefined;
    }

    if (now() > entry.expiresAt) {
      cache.delete(query);
      return undefined;
    }

    return [...entry.value];
  }, []);

  const setCached = useCallback((query: string, value: Item[]) => {
    cache.set(query, {
      value: [...value],
      expiresAt: now() + CACHE_TTL_MS,
    });
  }, []);

  return [getCached, setCached] as const;
};

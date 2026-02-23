import { useCallback } from "react";
import { Item } from "../api/api";

type CacheEntry = {
  data: Item[];
  expiresAt: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
const cacheMap = new Map<string, CacheEntry>();

export const useCache = () => {
  const getCachedData = useCallback((query: string) => {
    const entry = cacheMap.get(query);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      cacheMap.delete(query);
      return null;
    }

    return [...entry.data];
  }, []);

  const setCachedData = useCallback((query: string, response: Item[]) => {
    cacheMap.set(query, {
      data: [...response],
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }, []);

  return [getCachedData, setCachedData] as const;
};

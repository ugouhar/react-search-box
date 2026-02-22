import { useCallback } from "react";
import { Item } from "../api/api";

const cacheMap = new Map<string, Item[]>();

export const useCache = () => {
  const getCachedData = useCallback((query: string) => {
    const cached = cacheMap.get(query);
    return cached ? [...cached] : undefined;
  }, []);

  const setCachedData = useCallback((query: string, response: Item[]) => {
    cacheMap.set(query, [...response]);
  }, []);

  return [getCachedData, setCachedData] as const;
};

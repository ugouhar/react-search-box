import { useCallback } from "react";

const cacheMap = new Map<string, string[]>();

export const useCache = () => {
  const getCachedData = useCallback((query: string) => {
    return cacheMap.get(query);
  }, []);

  const setCachedData = useCallback((query: string, response: string[]) => {
    cacheMap.set(query, response);
  }, []);

  return [getCachedData, setCachedData] as const;
};

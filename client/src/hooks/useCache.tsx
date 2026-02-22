const cacheMap = new Map<string, string[]>();

export const useCache = () => {
  const getCachedData = (query: string) => {
    return cacheMap.get(query);
  };

  const setCachedData = (query: string, response: string[]) => {
    cacheMap.set(query, response);
  };

  return [getCachedData, setCachedData] as const;
};

const LOCAL_STORAGE_CACHE_KEY = "local-storage-cache";

export const useLocalStorageCache = () => {
  const getCachedData = (query) => {
    const strValue = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (strValue) {
      const jsonValue = JSON.parse(strValue);
      return jsonValue[query];
    }
    return null;
  };

  const setCachedData = (query: string, response: string[]) => {
    if (!query) return;

    const cachedData = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_CACHE_KEY) || "{}",
    );
    const updatedCachedData = JSON.stringify({
      ...cachedData,
      [query]: response,
    });
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, updatedCachedData);
  };

  return [getCachedData, setCachedData] as const;
};

const LOCAL_STORAGE_CACHE_KEY = "local-storage-cache";

export const useLocalStorageCache = () => {
  const getCachedData = () => {
    const strValue = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    return strValue ? JSON.parse(strValue) : {};
  };

  const setCachedData = (query: string, response: string[]) => {
    if (!query) return;

    const cachedData = getCachedData();
    const updatedCachedData = JSON.stringify({
      ...cachedData,
      [query]: response,
    });
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, updatedCachedData);
  };

  return [getCachedData, setCachedData];
};

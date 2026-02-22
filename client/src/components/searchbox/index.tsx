import { useEffect, useState, type ChangeEvent } from "react";
import { Item, searchApi } from "../../api/api";
import { SearchResult } from "../searchresult";
import { useCache } from "../../hooks/useCache";

export const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [getCachedData, setCachedData] = useCache();
  const [servedFromCache, setServedFromCache] = useState(false);
  const [error, setError] = useState();
  const normalizedSearchQuery = searchQuery.toLowerCase().trimStart().trimEnd();

  const handleSetSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (!normalizedSearchQuery) {
      setError(null);
      setServedFromCache(false);
      setSearchResult([]);
      setIsLoading(false);

      return;
    }
    let ignore = false;
    const controller = new AbortController();
    const signal = controller.signal;
    let data = [];
    let timer;
    const cachedResponse = getCachedData(normalizedSearchQuery);

    if (cachedResponse) {
      data = cachedResponse;
      setServedFromCache(true);
      setSearchResult(data);
    } else {
      setIsLoading(true);
      setServedFromCache(false);
      timer = setTimeout(() => {
        const fetchData = async () => {
          try {
            data = await searchApi(normalizedSearchQuery, { signal });

            if (!ignore) {
              setSearchResult(data);
              setIsLoading(false);
              setCachedData(normalizedSearchQuery, data);
              setError(null);
            }
          } catch (err) {
            if (!ignore && err.name != "AbortError") {
              setSearchResult([]);
              setIsLoading(false);
              setError(err.message);
            }
          }
        };
        fetchData();
      }, 500);
    }

    return () => {
      clearTimeout(timer);
      ignore = true;
      controller.abort();
    };
  }, [searchQuery]);

  return (
    <>
      <input
        value={searchQuery}
        onChange={handleSetSearchQuery}
        className="search-box"
        placeholder={normalizedSearchQuery ? "" : "Search users"}
      />
      {normalizedSearchQuery && (
        <>
          {servedFromCache ? (
            <div>
              <i>Served from cache !!</i>
              <SearchResult searchResult={searchResult} />
            </div>
          ) : isLoading ? (
            <h2>Loading...</h2>
          ) : error ? (
            <div>
              <i>Error in fetching: {error}</i>
            </div>
          ) : (
            <div>
              <i>Served from network !!</i>
              <SearchResult searchResult={searchResult} />
            </div>
          )}
        </>
      )}
    </>
  );
};

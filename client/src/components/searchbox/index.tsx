import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Item, searchApi } from "../../api/api";
import { SearchResult } from "../searchresult";
import { useLocalStorageCache } from "../../hooks/useLocalStorageCache";

export const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [getCachedData, setCachedData] = useLocalStorageCache();
  const [servedFromCache, setServedFromCache] = useState(false);
  const [error, setError] = useState();

  const handleSetSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const trimmedSearchQuery = searchQuery.trimStart().trimEnd();
    let ignore = false;
    const controller = new AbortController();
    const signal = controller.signal;
    let data = [];
    let timer;
    const cachedResponse = getCachedData(trimmedSearchQuery);

    if (cachedResponse) {
      data = cachedResponse;
      setServedFromCache(true);
      setSearchResult(data);
    } else {
      setServedFromCache(false);
      timer = setTimeout(() => {
        const fetchData = async () => {
          try {
            data = await searchApi(trimmedSearchQuery, { signal });

            if (!ignore) {
              setSearchResult(data);
              setIsLoading(false);
              setCachedData(trimmedSearchQuery, data);
            }

            setError(null);
          } catch (err) {
            if (err.name != "AbortError") {
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
      setSearchResult([]);
      setIsLoading(true);
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
      />
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
  );
};

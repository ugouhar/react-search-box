import { useEffect, useState, type ChangeEvent } from "react";
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
    const timer = setTimeout(() => {
      const fetchData = async () => {
        try {
          let data = [];
          const cachedResponse = getCachedData(trimmedSearchQuery);

          if (cachedResponse) {
            data = cachedResponse;
            setServedFromCache(true);
          } else {
            data = await searchApi(trimmedSearchQuery);
            setServedFromCache(false);
          }

          if (!ignore) {
            setSearchResult(data);
            setIsLoading(false);
            setCachedData(trimmedSearchQuery, data);
          }

          setError(null);
        } catch (err) {
          console.log(err);
          setSearchResult([]);
          setIsLoading(false);
          setError(err.message);
        }
      };
      fetchData();
    }, 200);

    return () => {
      setSearchResult([]);
      setIsLoading(true);
      clearTimeout(timer);
      ignore = true;
    };
  }, [searchQuery]);

  return (
    <>
      <input
        value={searchQuery}
        onChange={handleSetSearchQuery}
        className="search-box"
      />
      {isLoading ? (
        <h2>Loading...</h2>
      ) : error ? (
        <b>Error in fetching: {error}</b>
      ) : (
        <div>
          {servedFromCache ? (
            <i>Served from cache !!</i>
          ) : (
            <i>Served from network !!</i>
          )}
          <SearchResult searchResult={searchResult} />
        </div>
      )}
    </>
  );
};

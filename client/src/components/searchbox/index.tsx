import { useEffect, useState, type ChangeEvent } from "react";
import { Item, searchApi } from "../../api/api";
import { SearchResult } from "../searchresult";
import { useCache } from "../../hooks/useCache";

type ResultSource = "cache" | "network" | null;

export const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [getCachedData, setCachedData] = useCache();
  const [source, setSource] = useState<ResultSource>(null);
  const [error, setError] = useState();
  const normalizedSearchQuery = searchQuery.toLowerCase().trimStart().trimEnd();

  const handleSetSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (!normalizedSearchQuery) {
      setError(null);
      setSource(null);
      if (searchResult.length > 0) {
        setSearchResult([]);
      }
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
      setSource("cache");
      setError(null);
      setIsLoading(false);
      setSearchResult(data);
    } else {
      setIsLoading(true);
      setSource(null);
      timer = setTimeout(() => {
        const fetchData = async () => {
          try {
            data = await searchApi(normalizedSearchQuery, { signal });

            if (!ignore) {
              setSearchResult(data);
              setIsLoading(false);
              setCachedData(normalizedSearchQuery, data);
              setError(null);
              setSource("network");
            }
          } catch (err) {
            if (!ignore && err.name != "AbortError") {
              setSearchResult([]);
              setIsLoading(false);
              setError(err.message);
              setSource(null);
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
  }, [getCachedData, normalizedSearchQuery, searchQuery, setCachedData]);

  return (
    <>
      <input
        value={searchQuery}
        onChange={handleSetSearchQuery}
        className="search-box"
        placeholder="Search users"
      />
      {normalizedSearchQuery && (
        <>
          {source === "cache" ? (
            <div>
              <i>Served from cache</i>
              <SearchResult searchResult={searchResult} />
            </div>
          ) : isLoading ? (
            <h2>Loading...</h2>
          ) : error ? (
            <div>
              <i>Error in fetching: {error}</i>
            </div>
          ) : source === "network" ? (
            <div>
              <i>Served from network</i>
              <SearchResult searchResult={searchResult} />
            </div>
          ) : null}
        </>
      )}
    </>
  );
};

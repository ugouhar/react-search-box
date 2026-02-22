import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
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
  const [error, setError] = useState<string | null>(null);

  const normalizedSearchQuery = useMemo(
    () => searchQuery.toLowerCase().trim(),
    [searchQuery],
  );

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeControllerRef = useRef<AbortController | null>(null);

  const handleSetSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    let ignore = false;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
      activeControllerRef.current = null;
    }

    if (!normalizedSearchQuery) {
      setError(null);
      setSource(null);
      setSearchResult([]);
      setIsLoading(false);

      return;
    }

    const cachedResponse = getCachedData(normalizedSearchQuery);
    if (cachedResponse !== undefined) {
      setSearchResult(cachedResponse);
      setError(null);
      setIsLoading(false);
      setSource("cache");
      return;
    }

    setSource(null);
    setError(null);
    setIsLoading(false);

    debounceTimerRef.current = setTimeout(() => {
      const controller = new AbortController();
      activeControllerRef.current = controller;
      setIsLoading(true);

      const fetchData = async () => {
        try {
          const response = (await searchApi(normalizedSearchQuery, {
            signal: controller.signal,
          })) as Item[];

          if (ignore) {
            return;
          }

          setSearchResult(response);
          setCachedData(normalizedSearchQuery, response);
          setError(null);
          setSource("network");
        } catch (err: unknown) {
          if (ignore) return;

          if (err instanceof Error && err.name === "AbortError") {
            return;
          }

          setSearchResult([]);
          setSource(null);
          setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
          if (!ignore) {
            setIsLoading(false);
          }
          if (activeControllerRef.current === controller) {
            activeControllerRef.current = null;
          }
        }
      };
      fetchData();
    }, 500);

    return () => {
      ignore = true;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
        activeControllerRef.current = null;
      }
    };
  }, [getCachedData, normalizedSearchQuery, setCachedData]);

  const renderLoading = () => {
    return <h2>Loading...</h2>;
  };

  const renderError = () => {
    return (
      <div>
        <i>Error in fetching: {error}</i>
      </div>
    );
  };

  const renderSearchResult = () => {
    return (
      <div>
        <i>Served from {source}</i>
        <SearchResult searchResult={searchResult} />
      </div>
    );
  };

  const renderBody = () => {
    if (!normalizedSearchQuery) {
      return null;
    }

    if (isLoading) {
      return renderLoading();
    }

    if (error) {
      return renderError();
    }

    if (!source) {
      return null;
    }

    return renderSearchResult();
  };

  return (
    <>
      <input
        value={searchQuery}
        onChange={handleSetSearchQuery}
        className="search-box"
        placeholder="Search users"
        aria-label="Search users"
      />
      {renderBody()}
    </>
  );
};

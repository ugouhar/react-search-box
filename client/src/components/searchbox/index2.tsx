import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Item, searchApi } from "../../api/api";
import { SearchResult } from "../searchresult";
import { useCache } from "../../hooks/useCache";

type ResultSource = "cache" | "network" | null;

export const SearchBoxV2 = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<ResultSource>(null);
  const [getCachedData, setCachedData] = useCache();

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeControllerRef = useRef<AbortController | null>(null);

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  useEffect(() => {
    let ignore = false;

    /**
     * 1. Cancel old work first.
     * Concept: every new query should invalidate prior debounce timers
     * and in-flight requests so outdated work never wins.
     * Why: prevents duplicate fetches and stale updates from previous
     * query states
     */
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
      activeControllerRef.current = null;
    }

    /**
     * 2. Handle empty query as a terminal state
     * Concept: empty input means “no active search”; reset UI and stop.
     * Why: ensures deterministic idle behavior and avoids unnecessary API calls.
     */
    if (!normalizedQuery) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      setSource(null);
      return;
    }

    /**
     * Fast path: cache hit
     * Concept: if result exists for this normalized query,
     * show it immediately and skip network.
     * Why: lower latency and meets “immediate cache display” requirement
     */
    const cached = getCachedData(normalizedQuery);
    if (cached !== undefined) {
      setResults(cached);
      setError(null);
      setIsLoading(false);
      setSource("cache");
      return;
    }

    /**
     * 4. Prepare network path state
     * Concept: clear transient UI before scheduling the debounced request.
     * Why: avoids showing stale source/error while waiting for debounce delay.
     */
    setSource(null);
    setError(null);
    setIsLoading(false);

    /**
     * 5. Debounce before fetching
     * Concept: only start fetch if user pauses typing for 500ms.
     * Why: reduces API load and stabilizes UX.
     */
    debounceTimerRef.current = setTimeout(() => {
      const controller = new AbortController();
      activeControllerRef.current = controller;
      setIsLoading(true);

      const fetchResults = async () => {
        try {
          const response = (await searchApi(normalizedQuery, {
            signal: controller.signal,
          })) as Item[];

          if (ignore) {
            return;
          }

          setResults(response);
          setCachedData(normalizedQuery, response);
          setError(null);
          setSource("network");
        } catch (err: unknown) {
          if (ignore) {
            return;
          }

          if (err instanceof Error && err.name === "AbortError") {
            return;
          }

          setResults([]);
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

      fetchResults();
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
  }, [getCachedData, normalizedQuery, setCachedData]);

  const renderBody = () => {
    if (!normalizedQuery) {
      return null;
    }

    if (isLoading) {
      return <h2>Loading...</h2>;
    }

    if (error) {
      return (
        <div>
          <i>Error in fetching: {error}</i>
        </div>
      );
    }

    if (!source) {
      return null;
    }

    return (
      <div>
        <i>Served from {source}</i>
        <SearchResult searchResult={results} />
      </div>
    );
  };

  return (
    <>
      <input
        value={query}
        onChange={handleQueryChange}
        className="search-box"
        placeholder="Search users"
        aria-label="Search users"
      />
      {renderBody()}
    </>
  );
};

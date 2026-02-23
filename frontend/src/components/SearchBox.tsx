import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { searchApi } from "../api/searchApi";
import { useQueryCache } from "../hooks/useQueryCache";
import type { Item } from "../types";
import { SearchResults } from "./SearchResults";

type ResultSource = "cache" | "network" | null;

export const SearchBox = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<ResultSource>(null);
  const [getCachedData, setCachedData] = useQueryCache();

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeControllerRef = useRef<AbortController | null>(null);

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  const onQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
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

    if (!normalizedQuery) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      setSource(null);
      return;
    }

    const cached = getCachedData(normalizedQuery);
    if (cached !== undefined) {
      setResults(cached);
      setError(null);
      setIsLoading(false);
      setSource("cache");
      return;
    }

    setError(null);
    setSource(null);
    setIsLoading(false);

    debounceTimerRef.current = setTimeout(() => {
      const controller = new AbortController();
      activeControllerRef.current = controller;
      setIsLoading(true);

      const run = async () => {
        try {
          const response = await searchApi(normalizedQuery, {
            signal: controller.signal,
          });

          if (ignore) {
            return;
          }

          setResults(response);
          setCachedData(normalizedQuery, response);
          setSource("network");
          setError(null);
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

      run();
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

  const renderState = () => {
    if (!normalizedQuery) {
      return <p className="hint">Start typing to search by name or email.</p>;
    }

    if (isLoading) {
      return <p className="loading">Loading...</p>;
    }

    if (error) {
      return (
        <p className="error" role="alert">
          Error: {error}
        </p>
      );
    }

    return (
      <>
        <p className="source">Served from: {source ?? "network"}</p>
        <SearchResults items={results} />
      </>
    );
  };

  return (
    <section className="search-panel">
      <label htmlFor="search-input" className="label">
        Search users
      </label>
      <input
        id="search-input"
        value={query}
        onChange={onQueryChange}
        className="search-input"
        placeholder="Type a name or email"
        autoComplete="off"
      />
      <div className="state-container">{renderState()}</div>
    </section>
  );
};

import { Item } from "../types";

type SearchApiOptions = {
  signal: AbortSignal;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const inflightByQuery = new Map<string, Promise<Item[]>>();

const normalizeQuery = (query: string) => query.trim().toLowerCase();

const isItem = (value: unknown): value is Item => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<Item>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string"
  );
};

const createAbortError = () => {
  try {
    return new DOMException("The operation was aborted.", "AbortError");
  } catch {
    const error = new Error("The operation was aborted.");
    error.name = "AbortError";
    return error;
  }
};

const withSignal = async <T>(promise: Promise<T>, signal: AbortSignal) => {
  if (signal.aborted) {
    throw createAbortError();
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(createAbortError());
    signal.addEventListener("abort", onAbort, { once: true });

    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
};

const fetchFromServer = async (normalizedQuery: string): Promise<Item[]> => {
  const encodedQuery = encodeURIComponent(normalizedQuery);
  const response = await fetch(`${API_BASE_URL}/data?query=${encodedQuery}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Invalid response shape");
  }

  return data.filter(isItem);
};

export const searchApi = async (
  query: string,
  { signal }: SearchApiOptions,
): Promise<Item[]> => {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  let inflight = inflightByQuery.get(normalizedQuery);
  if (!inflight) {
    inflight = fetchFromServer(normalizedQuery).finally(() => {
      inflightByQuery.delete(normalizedQuery);
    });
    inflightByQuery.set(normalizedQuery, inflight);
  }

  return withSignal(inflight, signal);
};

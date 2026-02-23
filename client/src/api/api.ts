export type Item = {
  id: string;
  name: string;
  email: string;
};

type SearchApiOptions = {
  signal: AbortSignal;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

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

const inflightByQuery = new Map();

export const searchApi = async (
  query: string,
  { signal }: SearchApiOptions,
): Promise<Item[]> => {
  const inflight = inflightByQuery.get(query);

  if (inflight) {
    return inflight;
  }

  const p = fetch(`${API_BASE_URL}/data?query=${query}`, {
    signal,
  }).finally(() => {
    inflightByQuery.delete(query);
  });

  const res = await p;

  if (res.ok) {
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid response shape");
    }

    inflightByQuery.set(query, p);

    return data.filter(isItem);
  }

  throw new Error(`Request failed: ${res.status} ${res.statusText}`);
};

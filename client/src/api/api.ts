export type Item = {
  id: string;
  name: string;
  email: string;
};

type SearchApiOptions = {
  signal: AbortSignal;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

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

export const searchApi = async (
  query: string,
  { signal }: SearchApiOptions,
): Promise<Item[]> => {
  const encodedQuery = encodeURIComponent(query);
  const res = await fetch(`${API_BASE_URL}/data?query=${encodedQuery}`, {
    signal,
  });
  if (res.ok) {
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid response shape");
    }

    return data.filter(isItem);
  }

  throw new Error(`Request failed: ${res.status} ${res.statusText}`);
};

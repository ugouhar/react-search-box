export type Item = {
  id: string;
  name: string;
  email: string;
};

type SearchApiOptions = {
  signal: AbortSignal;
};

export const searchApi = async (
  query: string,
  { signal }: SearchApiOptions,
): Promise<Item[]> => {
  const encodedQuery = encodeURIComponent(query);
  const res = await fetch(`http://localhost:3000/data?query=${encodedQuery}`, {
    signal,
  });
  if (res.ok) {
    const data = (await res.json()) as Item[];
    return data;
  }

  throw new Error("Fetch error");
};

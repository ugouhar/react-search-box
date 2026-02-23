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
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid response shape");
    }

    const validatedData: Item[] = data.map((item) => {
      const updatedItem = { ...item };
      if (!updatedItem.id) updatedItem.id = "";
      if (!updatedItem.name) updatedItem.name = "";
      if (!updatedItem.email) updatedItem.email = "";
      return updatedItem;
    });

    return validatedData;
  }

  throw new Error(`Request failed: ${res.status} ${res.statusText}`);
};

export type Item = {
  id: string;
  name: string;
  email: string;
};

type SearchApiOptions = {
  signal: AbortSignal;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

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

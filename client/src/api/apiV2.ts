export type Item = {
  id: string;
  name: string;
  email: string;
};

type SearchApiOptions = {
  signal: AbortSignal;
};

const DATASET_SIZE = 800;
const FAILURE_RATE = 0.1;
const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 800;

const records: Item[] = Array.from({ length: DATASET_SIZE }, (_, index) => {
  const n = index + 1;
  return {
    id: `id${n}`,
    name: `name${n}`,
    email: `email${n}@example.com`,
  };
});

const inflightByQuery = new Map<string, Promise<Item[]>>();

const normalizeQuery = (query: string) => query.trim().toLowerCase();

const randomDelay = () =>
  Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;

const createAbortError = () => {
  try {
    return new DOMException("The operation was aborted.", "AbortError");
  } catch {
    const err = new Error("The operation was aborted.");
    err.name = "AbortError";
    return err;
  }
};

const runSearch = async (normalizedQuery: string): Promise<Item[]> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, randomDelay());
  });

  if (Math.random() < FAILURE_RATE) {
    throw new Error("Something went wrong. Please try again.");
  }

  return records.filter(
    (item) =>
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.email.toLowerCase().includes(normalizedQuery),
  );
};

const withAbort = async <T>(promise: Promise<T>, signal: AbortSignal) => {
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
    inflight = runSearch(normalizedQuery).finally(() => {
      inflightByQuery.delete(normalizedQuery);
    });
    inflightByQuery.set(normalizedQuery, inflight);
  }

  return withAbort(inflight, signal);
};

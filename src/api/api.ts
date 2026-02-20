export type Item = {
  id: string;
  name: string;
  email: string;
};

const data: Item[] = [];

const generateData = () => {
  const N = 800;
  for (let i = 0; i < N; i++) {
    data.push({
      id: `id${i}`,
      name: `name${i}`,
      email: `email${i}`,
    });
  }
};

generateData();

export const searchApi = (query: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const matchedResponse = data.filter((item) => {
        if (
          item.id.includes(query) ||
          item.name.includes(query) ||
          item.email.includes(query)
        ) {
          return true;
        }
        return false;
      });
      resolve(matchedResponse);
    }, 1000);
  });
};

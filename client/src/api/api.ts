export type Item = {
  id: string;
  name: string;
  email: string;
};

const data: Item[] = [];

const generateData = () => {
  const N = 800;
  for (let i = 1; i <= N; i++) {
    data.push({
      id: `id${i}`,
      name: `name${i}`,
      email: `email${i}`,
    });
  }
};

generateData();

let queriesCount = 0;
export const searchApiMock = async (query: string) => {
  let failQuery = false;
  queriesCount++;
  if (queriesCount % 9 == 0) {
    queriesCount = 0;
    failQuery = true;
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failQuery) {
        reject("Something went wrong !!");
      }

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
    }, 2000);
  });
};

export const searchApi = async (query: string) => {
  const res = await fetch(`http://localhost:3000/data?query=${query}`);
  const data = await res.json();
  return data;
};

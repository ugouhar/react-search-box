import { Item } from "../../api/api";

export const SearchResult = ({ searchResult }: { searchResult: Item[] }) => {
  if (searchResult.length == 0) {
    return <h2>No result found !!</h2>;
  }

  return (
    <ol>
      {searchResult.map((item) => (
        <li key={item.id}>{(item.id, item.name, item.email)}</li>
      ))}
    </ol>
  );
};

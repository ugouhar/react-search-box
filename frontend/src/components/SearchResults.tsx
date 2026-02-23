import { Item } from "../types";

type SearchResultsProps = {
  items: Item[];
};

export const SearchResults = ({ items }: SearchResultsProps) => {
  if (items.length === 0) {
    return <p className="empty-state">No results found.</p>;
  }

  return (
    <ul className="results-list">
      {items.map((item) => (
        <li key={item.id} className="result-item">
          <div className="result-name">{item.name}</div>
          <div className="result-email">{item.email}</div>
        </li>
      ))}
    </ul>
  );
};

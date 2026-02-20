import { useState, type ChangeEvent } from "react";

export const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSetSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  return <input value={searchQuery} onChange={handleSetSearchQuery} />;
};

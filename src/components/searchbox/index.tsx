import { useEffect, useState, type ChangeEvent } from "react";
import { Item, searchApi } from "../../api/api";
import { SearchResult } from "../searchresult";

export const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSetSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    (async () => {
      const data = await searchApi(searchQuery);
      setSearchResult(data);
      setIsLoading(false);
      return () => {
        setSearchResult([]);
        setIsLoading(true);
      };
    })();
  }, [searchQuery]);

  return (
    <>
      <input
        value={searchQuery}
        onChange={handleSetSearchQuery}
        className="search-box"
      />
      {isLoading ? (
        <h2>Loading...</h2>
      ) : (
        <SearchResult searchResult={searchResult} />
      )}
    </>
  );
};

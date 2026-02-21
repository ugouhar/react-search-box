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
    let ignore = false;
    const timer = setTimeout(() => {
      const fetchData = async () => {
        try {
          console.log("Fetching... ", searchQuery);
          const data = await searchApi(searchQuery);
          if (!ignore) {
            setSearchResult(data);
            setIsLoading(false);
          }
        } catch (err) {
          console.log(err);
          setSearchResult([]);
          setIsLoading(false);
        }
      };
      fetchData();
    }, 200);

    return () => {
      setSearchResult([]);
      setIsLoading(true);
      clearTimeout(timer);
      ignore = true;
    };
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

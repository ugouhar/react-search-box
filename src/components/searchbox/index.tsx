import { useEffect, useState, type ChangeEvent } from "react";
import { Item, searchApi } from "../../api/api";
import { SearchResult } from "../searchresult";
import { useLocalStorageCache } from "../../hooks/useLocalStorageCache";

export const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [getCachedData, setCachedData] = useLocalStorageCache();

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
            setCachedData(searchQuery, data);
          }
        } catch (err) {
          console.log(err);
          setSearchResult([]);
          setIsLoading(false);
        }
      };
      fetchData();
    }, 500);

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

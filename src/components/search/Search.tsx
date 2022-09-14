import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { useSearchContext } from "../../context/GameStoreContext";

const Search = () => {
  const { searchParams, setSearchParams } = useSearchContext();
  const [inputValue, setInputValue] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (location.pathname != "/search") {
      setInputValue("");
    }
  }, [location.pathname]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
    setSearchParams({ sr: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="search" value={inputValue} onChange={handleInputChange} />
    </form>
  );
};

export default Search;

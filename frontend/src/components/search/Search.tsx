import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAppContext } from "../../context/GameStoreContext";

const Search = () => {
  const { setSearchParams } = useAppContext();
  const [inputValue, setInputValue] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setInputValue("");
  }, [location.pathname]);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    navigate(`/search?sr=${inputValue}`);
  };

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);

    if (location.pathname.toString() == "/search")
      setSearchParams({ sr: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="search" value={inputValue} onChange={handleInputChange} />
    </form>
  );
};

export default Search;

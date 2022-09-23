import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useAppContext } from "../../context/GameStoreContext";

const SearchInput = styled.input`
  width: 25.671875rem;
  height: 0;
  padding: 1.25rem 0.75rem;
  border-radius: 6px;
  border: 0.1px solid rgba(255, 255, 255, 0.25);
  background: rgba(168, 168, 168, 0.17);
  color: #fff;
`;

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
      <SearchInput
        type="search"
        value={inputValue}
        placeholder="🔍 Search"
        onChange={handleInputChange}
      />
    </form>
  );
};

export default Search;

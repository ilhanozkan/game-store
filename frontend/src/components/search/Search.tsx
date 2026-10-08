import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { MdOutlineSearch } from "react-icons/md";

import { colors } from "../../styles/theme";

export const SEARCH_PARAM = "sr";

const SearchForm = styled.form`
  position: relative;
  width: min(25.671875rem, 100%);
`;

const SearchIcon = styled(MdOutlineSearch)`
  position: absolute;
  top: 50%;
  left: 0.875rem;
  transform: translateY(-50%);
  color: ${colors.textMuted};
  font-size: 1.25rem;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(168, 168, 168, 0.17);
  color: #fff;
  font-size: 1rem;

  &::placeholder {
    color: ${colors.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const onSearchPage = location.pathname === "/search";
  const [inputValue, setInputValue] = useState(
    onSearchPage ? searchParams.get(SEARCH_PARAM) || "" : ""
  );

  // Clear the box when leaving the search page.
  useEffect(() => {
    if (!onSearchPage) setInputValue("");
  }, [onSearchPage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(
      `/search?${SEARCH_PARAM}=${encodeURIComponent(inputValue.trim())}`
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Update results live while already on the search page.
    if (onSearchPage) {
      setSearchParams({ [SEARCH_PARAM]: e.target.value }, { replace: true });
    }
  };

  return (
    <SearchForm role="search" onSubmit={handleSubmit}>
      <SearchIcon aria-hidden />
      <SearchInput
        type="search"
        value={inputValue}
        placeholder="Search products"
        aria-label="Search products"
        onChange={handleInputChange}
      />
    </SearchForm>
  );
};

export default Search;

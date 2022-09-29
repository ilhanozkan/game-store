import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Button = styled.button`
  padding: 0.9375rem 1.25rem;
  background-color: #618dff;
  border: none;
  border-radius: 100rem;
  transition: background-color 150ms ease-in;
  font-size: 1rem;
  color: #ffffff;
  cursor: pointer;

  &:hover {
    background-color: #567bdc;
  }
`;

const CatalogButton = () => {
  return (
    <Link to="/catalog">
      <Button type="button">Go to catalog</Button>
    </Link>
  );
};

export default CatalogButton;

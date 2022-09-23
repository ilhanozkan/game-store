import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Button = styled.button`
  padding: 0.9375rem 1.25rem;
  background-color: #618dff;
  border-radius: 100rem;
  transition: background-color 150ms ease-in;
  font-size: 1rem;

  a {
    color: #ffffff;
  }

  &:hover {
    background-color: #567bdc;
  }
`;

const CatalogButton = () => {
  return (
    <Button type="button">
      <Link to="/catalog">Go to catalog</Link>
    </Button>
  );
};

export default CatalogButton;

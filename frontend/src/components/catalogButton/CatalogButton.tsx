import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Button = styled.button`
  background-color: #618dff;
`;

const CatalogButton = () => {
  return (
    <div>
      <Button type="button">
        <Link to="/catalog">Go to catalog</Link>
      </Button>
    </div>
  );
};

export default CatalogButton;

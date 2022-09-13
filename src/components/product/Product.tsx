import React from "react";
import styled from "styled-components";

import Data from "../../data/Data";

const Container = styled.div`
  background: #2d2d2e;
  color: #fff;
`;

const Product = () => {
  return <Container>{Data[0].id}</Container>;
};

export default Product;

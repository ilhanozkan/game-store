import React from "react";
import styled from "styled-components";

import Data from "../../data/Data.json";
import Product from "../product/Product";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Products = () => {
  return (
    <Container>
      {Data.map((data) => (
        <Product
          key={data.id}
          id={data.id}
          name={data.name}
          category={data.category}
          price={data.price}
          stock={data.stock}
          img={data.img}
        />
      ))}
    </Container>
  );
};

export default Products;

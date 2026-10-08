import React from "react";
import styled from "styled-components";

import { Product } from "../../types/Types";
import ProductCard from "../productCard/ProductCard";

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16.5rem, 1fr));
  gap: 4rem 1.75rem;
  padding-top: 2.5rem;
  list-style: none;
`;

const ProductGrid = ({ products }: { products: Product[] }) => (
  <Grid>
    {products.map((product) => (
      <li key={product._id}>
        <ProductCard product={product} />
      </li>
    ))}
  </Grid>
);

export default ProductGrid;

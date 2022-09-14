import React from "react";
import styled from "styled-components";
import Fuse from "fuse.js";

import Data from "../../data/Data.json";
import Product from "../product/Product";
import { useSearchContext } from "../../context/GameStoreContext";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Products = () => {
  const { searchParams } = useSearchContext();

  const options = {
    keys: ["name", "category"],
  };

  const fuse = new Fuse(Data, options);

  return (
    <Container>
      {fuse.search(searchParams.get("sr") || "").length > 0
        ? fuse
            .search(searchParams.get("sr") || "")
            .map((data) => (
              <Product
                key={data.item.id}
                id={data.item.id}
                name={data.item.name}
                category={data.item.category}
                price={data.item.price}
                stock={data.item.stock}
                img={data.item.img}
              />
            ))
        : Data.map((data) => (
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

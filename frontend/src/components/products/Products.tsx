import React from "react";
import styled from "styled-components";
import Fuse from "fuse.js";
import { useQuery, gql } from "@apollo/client";

import Product from "../product/Product";
import { useSearchContext } from "../../context/GameStoreContext";

const PRODUCTS_QUERY = gql`
  query getProducts {
    products {
      id
      name
      category
      stock
      price
      img
    }
  }
`;

type ProductsDataType = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  img: string;
};

type ProductsType = {
  products: ProductsDataType[];
};

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Products = () => {
  const { loading, error, data } = useQuery<ProductsType>(PRODUCTS_QUERY);
  const { searchParams } = useSearchContext();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const options = {
    keys: ["name", "category"],
  };

  const fuse = new Fuse(data?.products || [], options);

  return (
    <Container>
      {fuse.search(searchParams.get("sr") || "").length > 0
        ? fuse
            .search(searchParams.get("sr") || "")
            .map((prod: any) => (
              <Product
                key={prod.item.id}
                id={prod.item.id}
                name={prod.item.name}
                category={prod.item.category}
                price={prod.item.price}
                stock={prod.item.stock}
                img={prod.item.img}
              />
            ))
        : data?.products?.map((prod: any) => (
            <Product
              key={prod.id}
              id={prod.id}
              name={prod.name}
              category={prod.category}
              price={prod.price}
              stock={prod.stock}
              img={prod.img}
            />
          ))}
    </Container>
  );
};

export default Products;

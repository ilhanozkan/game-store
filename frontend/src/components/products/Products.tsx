import React from "react";
import styled from "styled-components";
import Fuse from "fuse.js";
import { useQuery, gql } from "@apollo/client";

import Product from "../product/Product";
import { useAppContext } from "../../context/GameStoreContext";
import Loading from "../loading/Loading";

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
  cartQuantity: number;
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
  const { searchParams } = useAppContext();

  if (loading) return <Loading />;
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
            .map((prod: any) => <Product key={prod.item.id} data={prod.item} />)
        : data?.products?.map((prod: any) => (
            <Product key={prod.id} data={prod} />
          ))}
    </Container>
  );
};

export default Products;

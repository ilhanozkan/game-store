import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Fuse from "fuse.js";
import { useQuery } from "@apollo/client";
import { useLocation } from "react-router-dom";

import Product from "../product/Product";
import Loading from "../loading/Loading";
import { useAppContext } from "../../context/GameStoreContext";
import { ProductsType, DataType } from "../../types/Types";
// Queries
import {
  PRODUCTS_QUERY,
  PRODUCTS_BY_CATEGORY_QUERY,
} from "../../queries/Queries";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const CategoryTitle = styled.h2`
  margin-bottom: 2rem;
`;

const Products = () => {
  const { searchParams } = useAppContext();
  const location = useLocation();
  const [cat, setCat] = useState("");
  const { loading, error, data } = useQuery<ProductsType>(PRODUCTS_QUERY);
  const {
    loading: loadingProductsByCategory,
    error: errorProductsByCategory,
    data: productsByCategory,
  } = useQuery(PRODUCTS_BY_CATEGORY_QUERY, {
    variables: { category: cat },
  });

  useEffect(() => {
    if (location.pathname.includes("/products/"))
      setCat(location.pathname.split("/")[2] || "");
  }, [location]);

  if (loading) return <Loading />;
  if (error) return <p>Error :(</p>;

  const options = {
    keys: ["name", "category"],
  };

  const fuse = new Fuse(data?.products || [], options);

  if (cat.length > 0) {
    if (loadingProductsByCategory) return <Loading />;
    if (errorProductsByCategory) return <p>Error :(</p>;
    if (productsByCategory?.productsByCategory.length == 0)
      return (
        <>
          <CategoryTitle>
            {cat
              .split("-")
              .map((e) => e.toUpperCase())
              .join(" ")}
          </CategoryTitle>
          <p>We couldn&apos;t find any products.</p>
        </>
      );

    return (
      <>
        <CategoryTitle>
          {cat
            .split("-")
            .map((e) => e.toUpperCase())
            .join(" ")}
        </CategoryTitle>
        <Container>
          {productsByCategory?.productsByCategory?.map((prod: DataType) => (
            <Product key={prod._id} data={prod} />
          ))}
        </Container>
      </>
    );
  }

  return (
    <Container>
      {fuse.search(searchParams.get("sr") || "").length > 0
        ? fuse
            .search(searchParams.get("sr") || "")
            .map((prod: Fuse.FuseResult<DataType>) => (
              <Product key={prod.item._id} data={prod.item} />
            ))
        : data?.products?.map((prod: DataType) => (
            <Product key={prod._id} data={prod} />
          ))}
    </Container>
  );
};

export default Products;

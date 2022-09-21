import React from "react";
import { useQuery, gql } from "@apollo/client";
import styled from "styled-components";

import Loading from "../../components/loading/Loading";
import Product from "../../components/product/Product";
import { FavsType } from "../../types/Types";

const USER_FAVS_QUERY = gql`
  query getUserFavs {
    userFavs(id: "1") {
      id
      name
      category
      price
      stock
      img
    }
  }
`;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Favorite = () => {
  const { loading, error, data } = useQuery<FavsType>(USER_FAVS_QUERY);

  if (loading) return <Loading />;
  if (error) return <p>Error :(</p>;

  return (
    <Container>
      {data?.userFavs?.map((prod: any) => (
        <Product key={prod.id} data={prod} />
      ))}
    </Container>
  );
};

export default Favorite;

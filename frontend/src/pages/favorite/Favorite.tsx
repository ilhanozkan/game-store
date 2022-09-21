import React from "react";
import { useQuery, gql } from "@apollo/client";
import styled from "styled-components";

import Loading from "../../components/loading/Loading";
import Product from "../../components/product/Product";
import { useAppContext } from "../../context/GameStoreContext";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Favorite = () => {
  const { favoritesList, favsLoading, favsError } = useAppContext();

  if (favsLoading) return <Loading />;
  if (favsError) return <p>Error :(</p>;

  return (
    <Container>
      {favoritesList?.map((prod: any) => (
        <Product key={prod.id} data={prod} />
      ))}
    </Container>
  );
};

export default Favorite;

import React from "react";
import styled from "styled-components";

import Loading from "../../components/loading/Loading";
import Product from "../../components/product/Product";
import { DataType } from "../../types/Types";
import { useAppContext } from "../../context/GameStoreContext";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const Favorite = () => {
  const { favoritesList, favsLoading, favsError } = useAppContext();

  if (favsLoading) return <Loading />;
  if (favsError) return <p>Error :(</p>;

  if (favoritesList.length == 0)
    return <p>You don&apos;t have a favorite product.</p>;

  return (
    <Container>
      {favoritesList?.map((prod: DataType) => (
        <Product key={prod._id} data={prod} />
      ))}
    </Container>
  );
};

export default Favorite;

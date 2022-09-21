import { gql } from "@apollo/client";

export const PRODUCTS_QUERY = gql`
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

export const USER_QUERY = gql`
  query getUser {
    user(id: "1") {
      favorites
    }
  }
`;

export const USER_FAVS_QUERY = gql`
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

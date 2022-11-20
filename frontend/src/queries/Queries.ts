import { gql } from "@apollo/client";

export const PRODUCTS_QUERY = gql`
  query getProducts {
    products {
      _id
      name
      category
      stock
      price
      img
    }
  }
`;

export const PRODUCTS_BY_CATEGORY_QUERY = gql`
  query getProductsByCategory($category: String!) {
    productsByCategory(category: $category) {
      _id
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
      _id
      name
      category
      price
      stock
      img
    }
  }
`;

import { gql } from "@apollo/client";

import { PRODUCT_CARD_FIELDS, USER_FIELDS } from "./Queries";

export const LOGIN_MUTATION = gql`
  ${USER_FIELDS}
  mutation login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        ...UserFields
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  ${USER_FIELDS}
  mutation register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        ...UserFields
      }
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  ${USER_FIELDS}
  mutation updateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFields
    }
  }
`;

export const TOGGLE_FAVORITE_MUTATION = gql`
  mutation toggleFavorite($productId: ID!) {
    toggleFavorite(productId: $productId) {
      _id
      favorites
    }
  }
`;

export const TOP_UP_MUTATION = gql`
  mutation topUpBalance($amount: Int!) {
    topUpBalance(amount: $amount) {
      _id
      balance
    }
  }
`;

export const CHECKOUT_MUTATION = gql`
  mutation checkout($items: [CartItemInput!]!) {
    checkout(items: $items) {
      _id
      reference
      total
      itemCount
      createdAt
    }
  }
`;

export const CREATE_PRODUCT_MUTATION = gql`
  ${PRODUCT_CARD_FIELDS}
  mutation createProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      ...ProductCardFields
    }
  }
`;

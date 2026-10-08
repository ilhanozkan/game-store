import { gql } from "@apollo/client";

export const PRODUCT_CARD_FIELDS = gql`
  fragment ProductCardFields on Product {
    _id
    name
    slug
    brand
    category
    categorySlug
    price
    stock
    img
    rating
    reviewCount
  }
`;

export const USER_FIELDS = gql`
  fragment UserFields on User {
    _id
    name
    username
    email
    img
    role
    balance
    favorites
    createdAt
  }
`;

export const PRODUCTS_QUERY = gql`
  ${PRODUCT_CARD_FIELDS}
  query getProducts($category: String, $sort: ProductSort) {
    products(category: $category, sort: $sort) {
      ...ProductCardFields
    }
  }
`;

export const PRODUCT_QUERY = gql`
  ${PRODUCT_CARD_FIELDS}
  query getProduct($id: ID!) {
    product(id: $id) {
      ...ProductCardFields
      description
      specs {
        label
        value
      }
    }
  }
`;

export const CATEGORIES_QUERY = gql`
  query getCategories {
    categories {
      _id
      name
      slug
      description
      productCount
    }
  }
`;

export const CATEGORY_QUERY = gql`
  query getCategory($slug: String!) {
    category(slug: $slug) {
      _id
      name
      slug
      description
      productCount
    }
  }
`;

export const ME_QUERY = gql`
  ${USER_FIELDS}
  query getMe {
    me {
      ...UserFields
    }
  }
`;

export const FAVORITES_QUERY = gql`
  ${PRODUCT_CARD_FIELDS}
  query getFavorites {
    me {
      _id
      favoriteProducts {
        ...ProductCardFields
      }
    }
  }
`;

export const MY_ORDERS_QUERY = gql`
  query getMyOrders {
    myOrders {
      _id
      reference
      itemCount
      total
      status
      createdAt
      items {
        productId
        name
        img
        price
        quantity
        subtotal
      }
    }
  }
`;

export const MY_TRANSACTIONS_QUERY = gql`
  query getMyTransactions {
    myTransactions {
      _id
      type
      amount
      balanceAfter
      description
      orderId
      createdAt
    }
  }
`;

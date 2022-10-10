const { gql } = require("apollo-server");

const typeDefs = gql`
  type Query {
    products: [Product]
    product(id: String): Product
    productsByCategory(category: String): [Product]
    user(id: String): User
    userFavs(id: String): [Product]
  }

  type Product {
    _id: ID!
    name: String!
    category: String!
    price: Float!
    stock: Int!
    img: String
  }

  type User {
    _id: ID!
    favorites: [String]
  }
`;

module.exports = typeDefs;

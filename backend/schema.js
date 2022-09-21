const { gql } = require("apollo-server");

const typeDefs = gql`
  type Query {
    products: [Product]
    product(id: String): Product
    user(id: String): User
    userFavs(id: String): [Product]
  }

  type Product {
    id: ID!
    name: String!
    category: String!
    price: Float!
    stock: Int!
    img: String
  }

  type User {
    id: ID!
    favorites: [String]
  }
`;

module.exports = typeDefs;

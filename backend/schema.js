const { gql } = require("apollo-server");

const typeDefs = gql`
  type Query {
    products: [Product]
  }

  type Product {
    id: ID!
    name: String!
    category: String!
    price: Float!
    stock: Int!
    img: String
  }
`;

module.exports = typeDefs;

const express = require("express");
const { json } = require("express");
const bodyParser = require("body-parser");
const app = express();
const dotenv = require("dotenv").config();
var cors = require("cors");

// Apollo GraphQL server
const { ApolloServer } = require("apollo-server");

// Apollo GraphQL type definitions
const typeDefs = require("./schema");

// Apollo GraphQL resolvers
const resolvers = require("./resolvers");

// Apollo GraphQL datasources
const ProductsAPI = require("./datasources/productsApi");

// Routes
const UsersRoute = require("./routes/users/users");
const { ProductsRoutes } = require("./routes/products/products.js");
const UserAPI = require("./datasources/userApi");

app.use(json());
app.use(cors());
app.use("/products", ProductsRoutes);
app.use("/users", UsersRoute);

app.listen(process.env.PORT || "8000", (err) =>
  console.log(`backend is running on port ${process.env.PORT || 8000}`)
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return { productsAPI: new ProductsAPI(), userAPI: new UserAPI() };
  },
});

server.listen(process.env.APOLLO_PORT || 4000).then(() => {
  console.log(`
    🚀  Server is running!
    🔉  Listening on port ${process.env.APOLLO_PORT || 4000}
    📭  Query at http://localhost:${process.env.APOLLO_PORT || 4000}
  `);
});

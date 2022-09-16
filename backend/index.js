const express = require("express");
const { json } = require("express");
const bodyParser = require("body-parser");
const app = express();
const dotenv = require("dotenv").config();

// Apollo GraphQL server
const { ApolloServer } = require("apollo-server");

// Apollo GraphQL type definitions
const typeDefs = require("./schema");

// Routes
const UsersRoute = require("./routes/users/users");
const ProductsRoutes = require("./routes/products/products.js");

app.use(json());
app.use("/products", ProductsRoutes);
app.use("/users", UsersRoute);

app.listen(process.env.PORT || "8000", (err) =>
  console.log(`backend is running on port ${process.env.PORT || 8000}`)
);

const mocks = {
  Query: () => ({
    products: () => [...new Array(8)],
  }),
  Product: () => ({
    id: () => Math.floor(Math.random() * 1000),
    name: () => "Oculus Quest",
    category: () => "VR Glasses",
    price: () => 25000,
    stock: () => 10,
    img: () => "/fake-data-images/oculus-quest-vr-glasses.png",
  }),
};

const server = new ApolloServer({ typeDefs, mocks });

server.listen(process.env.APOLLO_PORT || 4000).then(() => {
  console.log(`
    🚀  Server is running!
    🔉  Listening on port ${process.env.APOLLO_PORT || 4000}
    📭  Query at http://localhost:${process.env.APOLLO_PORT || 4000}
  `);
});

const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");

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

server.listen(5000).then(() => {
  console.log(`
    🚀  Server is running!
    🔉  Listening on port 5000
    📭  Query at http://localhost:5000
  `);
});

const { before, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const models = require("../../models");

/**
 * Registers hooks that run the current test file against a fresh in-memory
 * MongoDB, emptying every collection before each test.
 */
const useTestDatabase = () => {
  let server;

  before(async () => {
    server = await MongoMemoryServer.create();
    await mongoose.connect(server.getUri("game-store-test"));
    await Promise.all(Object.values(models).map((Model) => Model.init()));
  });

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map((collection) =>
        collection.deleteMany({})
      )
    );
  });

  after(async () => {
    await mongoose.disconnect();
    await server.stop();
  });
};

module.exports = { useTestDatabase };

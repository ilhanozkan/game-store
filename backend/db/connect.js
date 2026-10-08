const mongoose = require("mongoose");

let memoryServer = null;

const startMemoryServer = async () => {
  // Required lazily so production installs without devDependencies never load it.
  const { MongoMemoryServer } = require("mongodb-memory-server");
  memoryServer = await MongoMemoryServer.create();
  return memoryServer.getUri("game-store");
};

/**
 * Connects Mongoose to MongoDB.
 *
 * When no URI is configured outside production, an ephemeral in-memory
 * MongoDB is started instead so the project runs without a local database.
 * Data stored there is lost when the process exits.
 */
const connectDatabase = async (uri = process.env.MONGO_URI) => {
  let connectionUri = uri;
  let inMemory = false;

  if (!connectionUri) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MONGO_URI must be set in production");
    }
    connectionUri = await startMemoryServer();
    inMemory = true;
  }

  await mongoose.connect(connectionUri);

  return { inMemory };
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

module.exports = { connectDatabase, disconnectDatabase };

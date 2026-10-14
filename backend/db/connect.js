const mongoose = require("mongoose");

let memoryServer = null;

// Environments where an ephemeral database is an acceptable fallback.
const IN_MEMORY_ENVIRONMENTS = new Set([undefined, "", "development", "test"]);

const startMemoryServer = async () => {
  // Required lazily so production installs without devDependencies never load it.
  const { MongoMemoryServer } = require("mongodb-memory-server");
  memoryServer = await MongoMemoryServer.create();
  return memoryServer.getUri("game-store");
};

/**
 * Connects Mongoose to MongoDB.
 *
 * During development (NODE_ENV unset, "development" or "test") a missing URI
 * starts an ephemeral in-memory MongoDB instead, so the project runs without
 * a local database. Data stored there is lost when the process exits. Any
 * other environment (production, staging, ...) requires MONGO_URI.
 */
const connectDatabase = async (uri = process.env.MONGO_URI) => {
  let connectionUri = uri;
  let inMemory = false;

  if (!connectionUri) {
    if (!IN_MEMORY_ENVIRONMENTS.has(process.env.NODE_ENV)) {
      throw new Error(
        `MONGO_URI must be set when NODE_ENV is "${process.env.NODE_ENV}"`
      );
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

const loadConfig = () => {
  try {
    return require("./config");
  } catch (error) {
    // Misconfiguration (e.g. a missing JWT_SECRET): explain it and stop.
    console.error(error.message);
    return process.exit(1);
  }
};

const config = loadConfig();
const { createApp } = require("./app");
const { connectDatabase, disconnectDatabase } = require("./db/connect");
const { seedDatabase } = require("./db/seed");

const SHUTDOWN_TIMEOUT_MS = 15000;

const start = async () => {
  const { inMemory } = await connectDatabase(config.mongoUri);
  if (inMemory) {
    await seedDatabase();
    console.warn(
      "MONGO_URI is not set: using a temporary in-memory MongoDB seeded with demo data."
    );
  }

  const { httpServer, apollo } = await createApp();
  await new Promise((resolve) => {
    httpServer.listen(config.port, resolve);
  });
  console.log(`🚀 API ready on http://localhost:${config.port}`);
  console.log(`   GraphQL: http://localhost:${config.port}/graphql`);
  console.log(`   REST:    http://localhost:${config.port}/api`);

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, finishing in-flight requests…`);
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
    try {
      // Drains the HTTP server (see ApolloServerPluginDrainHttpServer).
      await apollo.stop();
      await disconnectDatabase();
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});

const config = require("./config");
const { createApp } = require("./app");
const { connectDatabase, disconnectDatabase } = require("./db/connect");
const { seedDatabase } = require("./db/seed");

const start = async () => {
  const { inMemory } = await connectDatabase(config.mongoUri);
  if (inMemory) {
    await seedDatabase();
    console.warn(
      "MONGO_URI is not set: using a temporary in-memory MongoDB seeded with demo data."
    );
  }

  const { app, apollo } = await createApp();
  const server = app.listen(config.port, () => {
    console.log(`🚀 API ready on http://localhost:${config.port}`);
    console.log(`   GraphQL: http://localhost:${config.port}/graphql`);
    console.log(`   REST:    http://localhost:${config.port}/api`);
  });

  const shutdown = async () => {
    server.close();
    await apollo.stop();
    await disconnectDatabase();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});

#!/usr/bin/env node
// Usage: npm run seed                       upsert categories, products and demo users
//        npm run seed -- --reset            drop every collection first
//        npm run seed -- --demo-users       create demo users even in production
require("dotenv").config();

const { connectDatabase, disconnectDatabase } = require("../db/connect");
const { seedDatabase } = require("../db/seed");

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is not set. Add it to backend/.env (see .env.example)."
    );
  }

  const reset = process.argv.includes("--reset");
  // The demo accounts have published passwords, so never create them in
  // production unless explicitly asked to.
  const demoUsers =
    process.env.NODE_ENV !== "production" ||
    process.argv.includes("--demo-users");

  await connectDatabase();
  const summary = await seedDatabase({ reset, demoUsers });

  const note = reset ? " (after reset)" : "";
  console.log(
    `Seeded ${summary.categories} categories and ${summary.products} products, created ${summary.usersCreated} users${note}.`
  );
  if (!demoUsers) {
    console.log("Skipped demo users because NODE_ENV=production.");
  }
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);

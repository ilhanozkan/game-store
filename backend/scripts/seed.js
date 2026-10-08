#!/usr/bin/env node
// Usage: npm run seed            upsert categories, products and demo users
//        npm run seed -- --reset  wipe every collection first
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
  await connectDatabase();
  const summary = await seedDatabase({ reset });

  const note = reset ? " (after reset)" : "";
  console.log(
    `Seeded ${summary.categories} categories and ${summary.products} products, created ${summary.usersCreated} users${note}.`
  );
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);

const { describe, it, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const { connectDatabase, disconnectDatabase } = require("../db/connect");

describe("connectDatabase", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(async () => {
    process.env.NODE_ENV = originalEnv;
    await disconnectDatabase();
  });

  it("refuses to start without MONGO_URI in production", async () => {
    process.env.NODE_ENV = "production";
    await assert.rejects(connectDatabase(""), /MONGO_URI must be set/);
  });

  it("falls back to an in-memory database during development", async () => {
    process.env.NODE_ENV = "development";
    const { inMemory } = await connectDatabase("");

    assert.equal(inMemory, true);
    assert.equal(mongoose.connection.readyState, 1);
  });
});

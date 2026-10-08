const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const os = require("node:os");
const path = require("node:path");

const CONFIG = path.join(__dirname, "..", "config.js");

// Loads config.js in a fresh process with only the given variables set.
const loadConfig = (env) =>
  spawnSync(
    process.execPath,
    [
      "-e",
      `const c = require(${JSON.stringify(
        CONFIG
      )}); console.log(JSON.stringify({ secretLength: c.jwtSecret.length, demoWallet: c.demoWallet }))`,
    ],
    {
      // Run outside backend/ so a developer's .env file isn't picked up.
      cwd: os.tmpdir(),
      env: { PATH: process.env.PATH, ...env },
      encoding: "utf8",
    }
  );

describe("config", () => {
  it("generates a random JWT secret for the in-memory database", () => {
    const result = loadConfig({});
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).secretLength, 64);
  });

  it("requires a JWT secret with a real database or in production", () => {
    for (const env of [
      { MONGO_URI: "mongodb://db/game-store" },
      { NODE_ENV: "production", MONGO_URI: "mongodb://db/game-store" },
    ]) {
      const result = loadConfig(env);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /JWT_SECRET must be set/);
    }
  });

  it("rejects short or placeholder secrets", () => {
    for (const secret of ["too-short", "replace-with-a-long-random-string"]) {
      const result = loadConfig({ JWT_SECRET: secret });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /at least 32 characters/);
    }
  });

  it("disables the demo wallet in production unless enabled", () => {
    const env = {
      NODE_ENV: "production",
      MONGO_URI: "mongodb://db/game-store",
      JWT_SECRET: "s".repeat(40),
    };
    assert.equal(JSON.parse(loadConfig(env).stdout).demoWallet, false);
    assert.equal(
      JSON.parse(loadConfig({ ...env, DEMO_WALLET: "true" }).stdout).demoWallet,
      true
    );
  });
});

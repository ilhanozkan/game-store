const { before, after, beforeEach } = require("node:test");
const request = require("supertest");

const { useTestDatabase } = require("./db");
const { createApp } = require("../../app");
const { seedDatabase } = require("../../db/seed");

/**
 * Registers hooks that build the app once per file and reseed the in-memory
 * database before each test. Returns helpers bound to the app.
 */
const useTestApp = () => {
  useTestDatabase();
  const state = {};

  before(async () => {
    Object.assign(state, await createApp());
  });

  beforeEach(async () => {
    await seedDatabase();
  });

  after(async () => {
    await state.apollo.stop();
  });

  const graphql = async (query, variables = {}, token) => {
    const req = request(state.app)
      .post("/graphql")
      .set("Content-Type", "application/json");
    if (token) req.set("Authorization", `Bearer ${token}`);
    const res = await req.send({ query, variables });
    return res.body;
  };

  const login = async (identifier, password) => {
    const { data } = await graphql(
      `
        mutation ($input: LoginInput!) {
          login(input: $input) {
            token
          }
        }
      `,
      { input: { identifier, password } }
    );
    return data.login.token;
  };

  return {
    request: () => request(state.app),
    graphql,
    login,
    loginAsCustomer: () => login("fola", "gamestore123"),
    loginAsAdmin: () => login("admin", "admin12345"),
  };
};

const errorCode = (body) => body.errors && body.errors[0].extensions.code;

module.exports = { useTestApp, errorCode };

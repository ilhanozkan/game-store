const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { useTestApp, errorCode } = require("./helpers/app");

// Separate file (and process): the limiter's state is module-wide.
const api = useTestApp();

const LOGIN = `
  mutation ($input: LoginInput!) { login(input: $input) { token } }
`;

describe("login rate limiting", () => {
  it("blocks a client after ten failed attempts, even with the right password", async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const res = await api.graphql(LOGIN, {
        input: { identifier: "fola", password: "wrong-password" },
      });
      assert.equal(errorCode(res), "UNAUTHENTICATED");
    }

    const blocked = await api.graphql(LOGIN, {
      input: { identifier: "fola", password: "gamestore123" },
    });
    assert.equal(errorCode(blocked), "TOO_MANY_REQUESTS");
    assert.match(blocked.errors[0].message, /try again in 15 minutes/);
  });
});

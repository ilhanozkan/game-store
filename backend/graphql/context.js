const { getUserFromAuthHeader } = require("../services/authService");
const {
  listCategories,
  countProductsByCategory,
} = require("../services/categoryService");

// Runs a lookup at most once per request. Wrapping in a promise matters:
// Mongoose queries are thenables that execute again on every await.
const once = (load) => {
  let promise;
  return () => {
    if (!promise) promise = Promise.resolve().then(load);
    return promise;
  };
};

const createContext = async ({ req }) => {
  const getCategories = once(listCategories);

  return {
    user: await getUserFromAuthHeader(req.headers.authorization),
    // Client address (honours TRUST_PROXY), used for rate limiting.
    clientId: req.ip,
    getCategories,
    getCategoryNames: once(
      async () => new Map((await getCategories()).map((c) => [c.slug, c.name]))
    ),
    getProductCounts: once(countProductsByCategory),
  };
};

module.exports = { createContext };

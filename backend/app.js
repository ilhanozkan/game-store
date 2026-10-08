const http = require("http");
const express = require("express");
const cors = require("cors");
const { GraphQLError } = require("graphql");
const { ApolloServer } = require("@apollo/server");
const { unwrapResolverError } = require("@apollo/server/errors");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { expressMiddleware } = require("@as-integrations/express5");

const config = require("./config");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { createContext } = require("./graphql/context");
const apiRouter = require("./routes/api");
const { notFound, errorHandler } = require("./middleware/errors");
const { toAppError } = require("./utils/errors");

// Gives every resolver error a stable extensions.code and hides the details
// of unexpected failures from clients.
const formatError = (formattedError, error) => {
  const original = unwrapResolverError(error);
  // Errors raised by GraphQL itself (syntax, validation, bad variables).
  if (original instanceof GraphQLError) return formattedError;

  const appError = toAppError(original);
  if (appError.status >= 500) console.error(original);
  return {
    message: appError.message,
    locations: formattedError.locations,
    path: formattedError.path,
    extensions: { code: appError.code },
  };
};

/**
 * Builds the Express app: REST endpoints under /api and the GraphQL API at
 * /graphql, served from a single port. Stopping Apollo also drains the HTTP
 * server, letting in-flight requests (e.g. a checkout) finish.
 */
const createApp = async () => {
  const app = express();
  const httpServer = http.createServer(app);
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "100kb" }));

  app.use("/api", apiRouter);

  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
    introspection: !config.isProduction,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    // index.js handles signals so shutdown runs once, in order.
    stopOnTerminationSignals: false,
  });
  await apollo.start();
  app.use("/graphql", expressMiddleware(apollo, { context: createContext }));

  app.use(notFound);
  app.use(errorHandler);

  return { app, httpServer, apollo };
};

module.exports = { createApp };

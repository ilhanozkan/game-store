const crypto = require("crypto");

require("dotenv").config();

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

const MIN_SECRET_LENGTH = 32;
// Values that appear in docs or examples and must never sign real tokens.
const PLACEHOLDER_SECRETS = new Set([
  "replace-with-a-long-random-string",
  "development-only-insecure-secret",
]);

/**
 * A real database (MONGO_URI) or production requires an explicit, strong
 * secret. The throwaway in-memory database gets a random secret per process,
 * since its tokens can't outlive its data anyway.
 */
const resolveJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    if (secret.length < MIN_SECRET_LENGTH || PLACEHOLDER_SECRETS.has(secret)) {
      throw new Error(
        `JWT_SECRET must be a random string of at least ${MIN_SECRET_LENGTH} characters`
      );
    }
    return secret;
  }
  if (process.env.MONGO_URI || isProduction) {
    throw new Error(
      "JWT_SECRET must be set when MONGO_URI is set or NODE_ENV=production"
    );
  }
  return crypto.randomBytes(32).toString("hex");
};

const parseOrigins = (value) => {
  if (!value || value.trim() === "*") return "*";
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

// Express "trust proxy" setting: a hop count ("1"), "true", or a list of
// addresses. Needed behind a load balancer so rate limits see client IPs.
const parseTrustProxy = (value) => {
  if (!value) return false;
  if (value === "true") return true;
  return /^\d+$/.test(value) ? Number(value) : value;
};

const config = {
  env,
  isProduction,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: parseOrigins(process.env.CORS_ORIGIN),
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  // Free store-credit top-ups are a demo feature, off in production unless
  // explicitly enabled.
  demoWallet: process.env.DEMO_WALLET
    ? process.env.DEMO_WALLET === "true"
    : !isProduction,
};

module.exports = config;

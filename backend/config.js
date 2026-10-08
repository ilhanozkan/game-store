require("dotenv").config();

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production");
}

const parseOrigins = (value) => {
  if (!value || value.trim() === "*") return "*";
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const config = {
  env,
  isProduction,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "development-only-insecure-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: parseOrigins(process.env.CORS_ORIGIN),
};

module.exports = config;

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config");
const { User } = require("../models");
const {
  AuthenticationError,
  ForbiddenError,
  ValidationError,
} = require("../utils/errors");
const { isObjectId } = require("../utils/objectId");
const { createRateLimiter } = require("../utils/rateLimit");

// Compared against when a login names an unknown user, so response times do
// not reveal which usernames exist.
const DUMMY_PASSWORD_HASH =
  "$2b$10$LR6dm76fzPElXPnXVg7NbOPTz2KgENfl83obwNH5mloBE3vSzwHeG";

const JWT_ALGORITHM = "HS256";

// Per-client limits that slow down password guessing and sign-up spam.
const failedLogins = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });
const registrations = createRateLimiter({
  limit: 10,
  windowMs: 60 * 60 * 1000,
});

const signToken = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: config.jwtExpiresIn,
  });

const parseBearerToken = (header = "") => {
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  return match ? match[1] : null;
};

// Reads the user id from a token, or null if it is missing, forged or expired.
const verifyToken = (token) => {
  try {
    const { sub } = jwt.verify(token, config.jwtSecret, {
      algorithms: [JWT_ALGORITHM],
    });
    return isObjectId(sub) ? sub : null;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) return null;
    throw error;
  }
};

/**
 * Resolves the user for an Authorization header. Missing, invalid or expired
 * tokens resolve to null so public queries keep working; database errors
 * still propagate instead of silently signing everyone out.
 */
const getUserFromAuthHeader = async (header) => {
  const token = parseBearerToken(header);
  const userId = token && verifyToken(token);
  return userId ? User.findById(userId) : null;
};

const register = async (
  { name, username, email, password },
  { clientId = "unknown" } = {}
) => {
  registrations.check(clientId);
  registrations.hit(clientId);

  const user = new User({ name, username, email });
  await user.setPassword(password);
  await user.save();
  return { token: signToken(user), user };
};

const login = async (
  { identifier, password },
  { clientId = "unknown" } = {}
) => {
  const value = String(identifier || "")
    .trim()
    .toLowerCase();
  if (!value || !password) {
    throw new ValidationError("Enter your username or email and password");
  }
  failedLogins.check(clientId);

  const user = await User.findOne({
    $or: [{ username: value }, { email: value }],
  }).select("+passwordHash");

  let valid = false;
  if (user) valid = await user.verifyPassword(password);
  // Hash anyway for unknown users so timing doesn't reveal which exist.
  else await bcrypt.compare(String(password), DUMMY_PASSWORD_HASH);

  if (!valid) {
    failedLogins.hit(clientId);
    throw new AuthenticationError("Invalid username or password");
  }

  return { token: signToken(user), user };
};

const requireUser = (user) => {
  if (!user) throw new AuthenticationError();
  return user;
};

const requireAdmin = (user) => {
  requireUser(user);
  if (user.role !== "admin") {
    throw new ForbiddenError("Only admins can do that");
  }
  return user;
};

module.exports = {
  signToken,
  getUserFromAuthHeader,
  register,
  login,
  requireUser,
  requireAdmin,
};

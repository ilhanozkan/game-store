const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config");
const { User } = require("../models");
const {
  AuthenticationError,
  ForbiddenError,
  ValidationError,
} = require("../utils/errors");

// Compared against when a login names an unknown user, so response times do
// not reveal which usernames exist.
const DUMMY_PASSWORD_HASH =
  "$2b$10$LR6dm76fzPElXPnXVg7NbOPTz2KgENfl83obwNH5mloBE3vSzwHeG";

const signToken = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

const parseBearerToken = (header = "") => {
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
};

/**
 * Resolves the user for an Authorization header. Missing, invalid or expired
 * tokens resolve to null so public queries keep working.
 */
const getUserFromAuthHeader = async (header) => {
  const token = parseBearerToken(header);
  if (!token) return null;

  try {
    const { sub } = jwt.verify(token, config.jwtSecret);
    return await User.findById(sub);
  } catch {
    return null;
  }
};

const register = async ({ name, username, email, password }) => {
  const user = new User({ name, username, email });
  await user.setPassword(password);
  await user.save();
  return { token: signToken(user), user };
};

const login = async ({ identifier, password }) => {
  const value = String(identifier || "")
    .trim()
    .toLowerCase();
  if (!value || !password) {
    throw new ValidationError("Enter your username or email and password");
  }

  const user = await User.findOne({
    $or: [{ username: value }, { email: value }],
  }).select("+passwordHash");

  if (!user) {
    await bcrypt.compare(String(password), DUMMY_PASSWORD_HASH);
    throw new AuthenticationError("Invalid username or password");
  }
  if (!(await user.verifyPassword(password))) {
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

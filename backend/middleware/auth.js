const {
  getUserFromAuthHeader,
  requireAdmin,
} = require("../services/authService");

// Attaches the user named by the Bearer token (or null) to req.user.
const authenticate = async (req, _res, next) => {
  req.user = await getUserFromAuthHeader(req.headers.authorization);
  next();
};

const adminOnly = (req, _res, next) => {
  requireAdmin(req.user);
  next();
};

module.exports = { authenticate, adminOnly };

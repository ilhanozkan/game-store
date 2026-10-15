const { NotFoundError, toAppError } = require("../utils/errors");

const notFound = (req, _res, next) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.path}`));
};

// Express recognises error handlers by their four arguments, so keep _next.
const errorHandler = (error, req, res, _next) => {
  // Client errors raised before routing by body-parser: malformed JSON,
  // unsupported charset or encoding, oversized payloads, ...
  if (error.expose && error.status >= 400 && error.status < 500) {
    const { message } = error;
    const code = "BAD_REQUEST";
    // GraphQL clients expect GraphQL-shaped errors.
    const body = req.originalUrl.startsWith("/graphql")
      ? { errors: [{ message, extensions: { code } }] }
      : { error: { message, code } };
    res.status(error.status).json(body);
    return;
  }

  const appError = toAppError(error);
  if (appError.status >= 500) console.error(appError.cause || error);

  res.status(appError.status).json({
    error: { message: appError.message, code: appError.code },
  });
};

module.exports = { notFound, errorHandler };

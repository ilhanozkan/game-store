const { NotFoundError, toAppError } = require("../utils/errors");

const notFound = (req, _res, next) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.path}`));
};

// Express recognises error handlers by their four arguments, so keep _next.
const errorHandler = (error, _req, res, _next) => {
  // Malformed JSON bodies and oversized payloads come from body-parser.
  if (error.type === "entity.parse.failed" || error.status === 413) {
    res.status(error.status || 400).json({
      error: { message: error.message, code: "BAD_REQUEST" },
    });
    return;
  }

  const appError = toAppError(error);
  if (appError.status >= 500) console.error(appError.cause || error);

  res.status(appError.status).json({
    error: { message: appError.message, code: appError.code },
  });
};

module.exports = { notFound, errorHandler };

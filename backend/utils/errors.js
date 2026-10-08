const mongoose = require("mongoose");

// Errors raised on purpose by the services. Each maps to an HTTP status for
// REST responses and an extensions.code for GraphQL responses.
class AppError extends Error {
  constructor(message, { status = 500, code = "INTERNAL_SERVER_ERROR" } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

class ValidationError extends AppError {
  constructor(message, code = "BAD_USER_INPUT") {
    super(message, { status: 400, code });
  }
}

class AuthenticationError extends AppError {
  constructor(message = "You must be signed in to do that") {
    super(message, { status: 401, code: "UNAUTHENTICATED" });
  }
}

class ForbiddenError extends AppError {
  constructor(message = "You are not allowed to do that") {
    super(message, { status: 403, code: "FORBIDDEN" });
  }
}

class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, { status: 404, code: "NOT_FOUND" });
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, { status: 409, code: "CONFLICT" });
  }
}

/**
 * Converts any thrown value into an AppError so REST and GraphQL report
 * failures consistently. Unexpected errors keep their message hidden.
 */
const toAppError = (error) => {
  if (error instanceof AppError) return error;

  if (error instanceof mongoose.Error.ValidationError) {
    const [first] = Object.values(error.errors);
    return new ValidationError(first ? first.message : error.message);
  }
  if (error instanceof mongoose.Error.CastError) {
    return new ValidationError(`Invalid value for ${error.path}`);
  }
  if (error && error.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
    return new ConflictError(
      field ? `That ${field} is already taken` : "Duplicate value"
    );
  }

  const internal = new AppError("Something went wrong. Please try again.");
  internal.cause = error;
  return internal;
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  toAppError,
};

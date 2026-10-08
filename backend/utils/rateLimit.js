const { AppError } = require("./errors");

class RateLimitError extends AppError {
  constructor(retryAfterMs) {
    const minutes = Math.max(1, Math.ceil(retryAfterMs / 60000));
    super(
      `Too many attempts. Please try again in ${minutes} minute${
        minutes === 1 ? "" : "s"
      }.`,
      { status: 429, code: "TOO_MANY_REQUESTS" }
    );
  }
}

const MAX_TRACKED_KEYS = 10000;

/**
 * Fixed-window, in-memory counter. Good enough for a single API process;
 * multiple instances would need a shared store such as Redis.
 */
const createRateLimiter = ({ limit, windowMs }) => {
  const windows = new Map();

  const current = (key, now) => {
    const entry = windows.get(key);
    return entry && entry.resetAt > now ? entry : null;
  };

  return {
    // Throws when `key` has used up its allowance for the current window.
    check(key) {
      const now = Date.now();
      const entry = current(key, now);
      if (entry && entry.count >= limit) {
        throw new RateLimitError(entry.resetAt - now);
      }
    },
    hit(key) {
      const now = Date.now();
      let entry = current(key, now);
      if (!entry) {
        if (windows.size >= MAX_TRACKED_KEYS) {
          windows.forEach((value, k) => {
            if (value.resetAt <= now) windows.delete(k);
          });
        }
        entry = { count: 0, resetAt: now + windowMs };
        windows.set(key, entry);
      }
      entry.count += 1;
    },
  };
};

module.exports = { createRateLimiter, RateLimitError };

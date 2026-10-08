const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema } = mongoose;

const PASSWORD_MIN_LENGTH = 8;
const BCRYPT_ROUNDS = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9_.]+$/;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [
        USERNAME_PATTERN,
        "Username may only contain letters, numbers, dots and underscores",
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_PATTERN, "Email address is invalid"],
    },
    // Never returned from queries unless explicitly selected with "+passwordHash".
    passwordHash: { type: String, required: true, select: false },
    img: { type: String, trim: true, default: "" },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    // Store credit in whole Naira (NGN), used to pay for orders.
    balance: { type: Number, min: 0, default: 0 },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { passwordHash, __v, ...safe } = ret;
        return safe;
      },
    },
  }
);

userSchema.methods.setPassword = async function setPassword(password) {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    const error = new mongoose.Error.ValidationError(this);
    error.addError(
      "password",
      new mongoose.Error.ValidatorError({
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
        path: "password",
      })
    );
    throw error;
  }
  this.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
};

userSchema.methods.verifyPassword = function verifyPassword(password) {
  if (!this.passwordHash || typeof password !== "string") {
    return Promise.resolve(false);
  }
  return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
module.exports.PASSWORD_MIN_LENGTH = PASSWORD_MIN_LENGTH;

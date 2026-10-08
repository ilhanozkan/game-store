const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { wholeNaira, imageUrl } = require("../utils/validators");

const { Schema } = mongoose;

const PASSWORD_MIN_LENGTH = 8;
// bcrypt ignores everything after 72 bytes, so longer passwords are rejected
// rather than silently truncated.
const PASSWORD_MAX_BYTES = 72;
const BCRYPT_ROUNDS = 10;
// Dot-separated domain labels without dots inside them, so matching stays
// linear even for hostile input.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const USERNAME_PATTERN = /^[a-z0-9_.]+$/;

const withoutSecrets = ({ passwordHash, __v, ...safe }) => safe;

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
      maxlength: 254,
      match: [EMAIL_PATTERN, "Email address is invalid"],
    },
    // Never returned from queries unless explicitly selected with "+passwordHash".
    passwordHash: { type: String, required: true, select: false },
    img: { type: String, trim: true, default: "", validate: imageUrl },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    // Store credit in whole Naira (NGN), used to pay for orders.
    balance: { type: Number, min: 0, default: 0, validate: wholeNaira },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
    // Strip the hash even when it was explicitly selected.
    toJSON: { transform: (_doc, ret) => withoutSecrets(ret) },
    toObject: { transform: (_doc, ret) => withoutSecrets(ret) },
  }
);

const passwordError = (doc, message) => {
  const error = new mongoose.Error.ValidationError(doc);
  error.addError(
    "password",
    new mongoose.Error.ValidatorError({ message, path: "password" })
  );
  return error;
};

userSchema.methods.setPassword = async function setPassword(password) {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    throw passwordError(
      this,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
    );
  }
  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
    throw passwordError(this, "Password must be at most 72 characters");
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

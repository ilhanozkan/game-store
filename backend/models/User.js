const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  img: { type: String, required: false },
  favorites: { type: Array, reqired: false, default: [] },
});

module.exports = mongoose.model("User", userSchema);

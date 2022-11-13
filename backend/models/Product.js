const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  img: { type: String, required: false },
  title: { type: String, required: true },
  description: { type: String, required: false },
  rating: { type: Number, required: true },
});

module.exports = mongoose.model("Product", productSchema);

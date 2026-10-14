const mongoose = require("mongoose");

const { slugify, SLUG_PATTERN } = require("../utils/slugify");
const { wholeNaira, imageUrl } = require("../utils/validators");

const { Schema } = mongoose;

const specSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 60 },
    value: { type: String, required: true, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: SLUG_PATTERN,
    },
    brand: { type: String, trim: true, maxlength: 60, default: "" },
    // Slug of the Category this product belongs to.
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: SLUG_PATTERN,
      index: true,
    },
    // Prices are stored in whole Naira (NGN).
    price: { type: Number, required: true, min: 0, validate: wholeNaira },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },
    img: { type: String, trim: true, default: "", validate: imageUrl },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    specs: { type: [specSchema], default: [] },
  },
  { timestamps: true }
);

productSchema.index(
  { name: "text", brand: "text", description: "text" },
  { weights: { name: 10, brand: 5, description: 1 } }
);

productSchema.pre("validate", function setSlug() {
  if (!this.slug && this.name) this.slug = slugify(this.name);
});

module.exports = mongoose.model("Product", productSchema);

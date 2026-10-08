const mongoose = require("mongoose");

const { wholeNaira } = require("../utils/validators");

const { Schema } = mongoose;

// Order items snapshot the product name, image and price at purchase time so
// order history stays accurate when the catalog changes later.
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true, trim: true },
    img: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0, validate: wholeNaira },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: "An order needs at least one item",
      },
    },
    total: { type: Number, required: true, min: 0, validate: wholeNaira },
    status: { type: String, enum: ["paid", "cancelled"], default: "paid" },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);

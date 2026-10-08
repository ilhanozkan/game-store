const mongoose = require("mongoose");

const { Schema } = mongoose;

// Ledger of balance changes. Top-ups have a positive amount, purchases a
// negative one, and balanceAfter records the user's balance once applied.
const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["top-up", "purchase"], required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true, min: 0 },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    description: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);

const mongoose = require("mongoose");

const { slugify, SLUG_PATTERN } = require("../utils/slugify");

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: SLUG_PATTERN,
    },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    // Controls the order categories are listed in navigation.
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.pre("validate", function setSlug() {
  if (!this.slug && this.name) this.slug = slugify(this.name);
});

module.exports = mongoose.model("Category", categorySchema);

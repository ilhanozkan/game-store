const { Category, Product } = require("../models");
const { slugify } = require("../utils/slugify");

const listCategories = () =>
  Category.find().sort({ position: 1, name: 1 }).lean().exec();

const getCategory = (slug) =>
  Category.findOne({ slug: String(slug).toLowerCase() })
    .lean()
    .exec();

/**
 * Resolves a category slug from a slug or display name, so "vr-glasses",
 * "VR Glasses" and "vr glasses" all find the same category.
 * Returns null when nothing matches.
 */
const resolveCategorySlug = async (value) => {
  const wanted = slugify(value);
  if (!wanted) return null;

  const categories = await Category.find({}, "name slug").lean();
  const match = categories.find(
    (category) => category.slug === wanted || slugify(category.name) === wanted
  );
  return match ? match.slug : null;
};

// Maps category slug -> number of products, for every category with products.
const countProductsByCategory = async () => {
  const counts = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  return new Map(counts.map(({ _id, count }) => [_id, count]));
};

module.exports = {
  listCategories,
  getCategory,
  resolveCategorySlug,
  countProductsByCategory,
};

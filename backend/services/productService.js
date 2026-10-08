const { Product } = require("../models");
const { resolveCategorySlug } = require("./categoryService");
const { ValidationError } = require("../utils/errors");
const { isObjectId } = require("../utils/objectId");

const SORTS = {
  FEATURED: { createdAt: 1, _id: 1 },
  NEWEST: { createdAt: -1, _id: -1 },
  PRICE_ASC: { price: 1, _id: 1 },
  PRICE_DESC: { price: -1, _id: 1 },
  RATING: { rating: -1, reviewCount: -1, _id: 1 },
  NAME: { name: 1, _id: 1 },
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Lists products, optionally filtered by category (slug or name), a search
 * term matched against name, brand and description, and stock availability.
 */
const listProducts = async ({
  category,
  search,
  sort = "FEATURED",
  inStockOnly = false,
} = {}) => {
  if (!SORTS[sort]) {
    throw new ValidationError(
      `Unknown sort "${sort}". Use one of: ${Object.keys(SORTS).join(", ")}`
    );
  }

  const filter = {};

  if (category) {
    const slug = await resolveCategorySlug(category);
    if (!slug) return [];
    filter.category = slug;
  }

  const term = typeof search === "string" ? search.trim() : "";
  if (term) {
    const pattern = new RegExp(escapeRegex(term), "i");
    filter.$or = [
      { name: pattern },
      { brand: pattern },
      { description: pattern },
    ];
  }

  if (inStockOnly) filter.stock = { $gt: 0 };

  return Product.find(filter)
    .sort(SORTS[sort])
    .collation({ locale: "en", strength: 2 })
    .lean();
};

// Finds a product by its ObjectId or its slug.
const getProduct = (idOrSlug) => {
  const value = String(idOrSlug || "").trim();
  if (!value) return Promise.resolve(null);
  if (isObjectId(value)) {
    return Product.findById(value).lean().exec();
  }
  return Product.findOne({ slug: value.toLowerCase() }).lean().exec();
};

// Fields callers may set when creating a product; everything else
// (ratings, timestamps, ids) is managed by the store.
const CREATABLE_FIELDS = [
  "name",
  "brand",
  "price",
  "stock",
  "img",
  "description",
  "specs",
];

const createProduct = async (input) => {
  const category = await resolveCategorySlug(input.category);
  if (!category) {
    throw new ValidationError(`Unknown category "${input.category}"`);
  }

  const fields = Object.fromEntries(
    CREATABLE_FIELDS.filter((key) => input[key] !== undefined).map((key) => [
      key,
      input[key],
    ])
  );
  const product = await Product.create({ ...fields, category });
  return product.toObject();
};

module.exports = {
  SORTS,
  listProducts,
  getProduct,
  createProduct,
};

const { Category, Product, User, Order, Transaction } = require("../models");
const categories = require("../data/categories.json");
const products = require("../data/products.json");
const users = require("../data/users.json");

const ALL_MODELS = [Category, Product, User, Order, Transaction];

// Upserts by a natural key, running schema validation (and hooks such as
// slug derivation) on every document. Sequential so documents are inserted in
// file order.
const upsertAll = async (Model, documents, key) => {
  for (const document of documents) {
    const doc = new Model(document);
    await doc.validate();
    const { _id, createdAt, updatedAt, ...fields } = doc.toObject();
    await Model.updateOne(
      { [key]: doc[key] },
      { $set: fields },
      { upsert: true, runValidators: true }
    );
  }
};

// Drops a collection, ignoring "namespace not found" when it doesn't exist.
const dropCollection = async (Model) => {
  try {
    await Model.collection.drop();
  } catch (error) {
    if (error.codeName !== "NamespaceNotFound") throw error;
  }
};

const ensureIndexes = async () => {
  try {
    await Promise.all(ALL_MODELS.map((Model) => Model.createIndexes()));
  } catch (error) {
    // Typically documents from an older schema (e.g. products without a
    // slug) that violate the new unique indexes.
    const wrapped = new Error(
      `Existing data doesn't fit the current schema (${error.message}). ` +
        "Run `npm run seed -- --reset` to start from a clean database."
    );
    wrapped.cause = error;
    throw wrapped;
  }
};

const createDemoUsers = async () => {
  const favoriteSlugs = [...new Set(users.flatMap((u) => u.favorites || []))];
  const favoriteProducts = await Product.find(
    { slug: { $in: favoriteSlugs } },
    "_id slug"
  );
  const idBySlug = new Map(favoriteProducts.map((p) => [p.slug, p._id]));

  let created = 0;
  // Sequential so a failure leaves a predictable state.
  for (const { password, favorites = [], ...profile } of users) {
    // Existing accounts are left untouched so re-seeding never resets passwords.
    if (await User.exists({ username: profile.username })) continue;

    const user = new User({
      ...profile,
      favorites: favorites.map((slug) => idBySlug.get(slug)).filter(Boolean),
    });
    await user.setPassword(password);
    await user.save();

    if (user.balance > 0) {
      await Transaction.create({
        user: user._id,
        type: "top-up",
        amount: user.balance,
        balanceAfter: user.balance,
        description: "Welcome credit",
      });
    }
    created += 1;
  }
  return created;
};

/**
 * Seeds categories, products and (optionally) demo users. Safe to run
 * repeatedly: categories and products are upserted by slug, restoring their
 * seed values, and users are only created once. Nothing is ever deleted
 * unless { reset: true } is passed, which drops every collection first.
 */
const seedDatabase = async ({ reset = false, demoUsers = true } = {}) => {
  if (reset) await Promise.all(ALL_MODELS.map(dropCollection));
  // Unique indexes must exist before inserting.
  await ensureIndexes();

  await upsertAll(Category, categories, "slug");
  await upsertAll(Product, products, "slug");
  const usersCreated = demoUsers ? await createDemoUsers() : 0;

  return {
    categories: categories.length,
    products: products.length,
    usersCreated,
  };
};

module.exports = { seedDatabase };

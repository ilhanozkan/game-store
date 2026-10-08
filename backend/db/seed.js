const {
  Category,
  Product,
  User,
  Order,
  Transaction,
} = require("../models");
const categories = require("../data/categories.json");
const products = require("../data/products.json");
const users = require("../data/users.json");

const ALL_MODELS = [Category, Product, User, Order, Transaction];

// Upserts by a natural key, running schema validation on every document.
// Sequential so documents are inserted in file order.
const upsertAll = async (Model, documents, key) => {
  for (const document of documents) {
    await new Model(document).validate();
    await Model.updateOne(
      { [key]: document[key] },
      { $set: document },
      { upsert: true, runValidators: true }
    );
  }
};

const createUsers = async () => {
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
 * Seeds categories, products and demo users. Safe to run repeatedly:
 * categories and products are upserted by slug, users are only created once.
 * Pass { reset: true } to wipe every collection first.
 */
const seedDatabase = async ({ reset = false } = {}) => {
  // Make sure unique indexes exist before inserting.
  await Promise.all(ALL_MODELS.map((Model) => Model.init()));

  if (reset) {
    await Promise.all(ALL_MODELS.map((Model) => Model.deleteMany({})));
  }

  await upsertAll(Category, categories, "slug");
  await upsertAll(Product, products, "slug");
  const usersCreated = await createUsers();

  return {
    categories: categories.length,
    products: products.length,
    usersCreated,
  };
};

module.exports = { seedDatabase };

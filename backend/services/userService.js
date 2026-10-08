const config = require("../config");
const { User, Product, Transaction } = require("../models");
const {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} = require("../utils/errors");
const { getProduct } = require("./productService");

// Upper bound for a single wallet top-up, in Naira.
const MAX_TOP_UP = 5000000;

/**
 * Adds the product to the user's favorites, or removes it when it is
 * already there. Uses conditional updates so concurrent toggles never
 * duplicate an entry.
 */
const toggleFavorite = async (user, productId) => {
  const product = await getProduct(productId);
  if (!product) throw new NotFoundError("Product not found");

  const added = await User.findOneAndUpdate(
    { _id: user._id, favorites: { $ne: product._id } },
    { $push: { favorites: product._id } },
    { returnDocument: "after" }
  );
  if (added) return added;

  return User.findByIdAndUpdate(
    user._id,
    { $pull: { favorites: product._id } },
    { returnDocument: "after" }
  );
};

// Favorite products, most recently added first. Deleted products are skipped.
const getFavoriteProducts = async (user) => {
  const ids = user.favorites || [];
  if (!ids.length) return [];

  const products = await Product.find({ _id: { $in: ids } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));
  return [...ids]
    .reverse()
    .map((id) => byId.get(String(id)))
    .filter(Boolean);
};

const updateProfile = async (user, { name, email, img }) => {
  const update = {};
  if (name !== undefined && name !== null) update.name = name;
  if (email !== undefined && email !== null) update.email = email;
  if (img !== undefined && img !== null) update.img = img;

  return User.findByIdAndUpdate(user._id, update, {
    returnDocument: "after",
    runValidators: true,
  });
};

const topUpBalance = async (user, amount) => {
  if (!config.demoWallet) {
    throw new ForbiddenError("Top-ups are disabled on this store");
  }
  if (!Number.isInteger(amount) || amount <= 0 || amount > MAX_TOP_UP) {
    throw new ValidationError(
      `Top-ups must be a whole amount between ₦1 and ₦${MAX_TOP_UP.toLocaleString(
        "en-NG"
      )}`
    );
  }

  const updated = await User.findByIdAndUpdate(
    user._id,
    { $inc: { balance: amount } },
    { returnDocument: "after" }
  );

  try {
    await Transaction.create({
      user: user._id,
      type: "top-up",
      amount,
      balanceAfter: updated.balance,
      description: "Wallet top-up",
    });
  } catch (error) {
    // Keep the balance and the ledger in agreement.
    await User.updateOne({ _id: user._id }, { $inc: { balance: -amount } });
    throw error;
  }

  return updated;
};

const listTransactions = (user) =>
  Transaction.find({ user: user._id })
    .sort({ createdAt: -1, _id: -1 })
    .lean()
    .exec();

module.exports = {
  MAX_TOP_UP,
  toggleFavorite,
  getFavoriteProducts,
  updateProfile,
  topUpBalance,
  listTransactions,
};

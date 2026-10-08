const { Order, Product, Transaction, User } = require("../models");
const { ValidationError } = require("../utils/errors");
const { isObjectId } = require("../utils/objectId");

const MAX_LINES = 50;
const MAX_QUANTITY = 99;

// Short reference shown to shoppers, e.g. "2F375B".
const orderReference = (id) => String(id).slice(-6).toUpperCase();

// Merges duplicate product lines and validates quantities.
const normaliseItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("Your cart is empty");
  }
  if (items.length > MAX_LINES) {
    throw new ValidationError(`Orders are limited to ${MAX_LINES} products`);
  }

  const quantities = new Map();
  items.forEach(({ productId, quantity }) => {
    if (!isObjectId(productId)) {
      throw new ValidationError(`Invalid product id "${productId}"`);
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ValidationError("Quantities must be whole numbers above zero");
    }
    const id = String(productId);
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  });

  quantities.forEach((quantity) => {
    if (quantity > MAX_QUANTITY) {
      throw new ValidationError(
        `You can buy at most ${MAX_QUANTITY} of a product per order`
      );
    }
  });

  return quantities;
};

const releaseStock = (reserved) =>
  Promise.all(
    reserved.map(({ product, quantity }) =>
      Product.updateOne({ _id: product }, { $inc: { stock: quantity } })
    )
  );

// Runs a compensating write, logging (not throwing) if it fails so the
// remaining rollback steps still run and the original error is kept.
const undo = async (step, action) => {
  try {
    await action();
  } catch (error) {
    console.error(`Checkout rollback step "${step}" failed:`, error);
  }
};

/**
 * Places an order paid from the user's balance.
 *
 * Stock and balance are changed with conditional atomic updates (so two
 * shoppers can never buy the same last item) and rolled back if a later step
 * fails. This works on standalone MongoDB servers, which do not support
 * multi-document transactions. A process crash mid-checkout can still leave
 * reserved stock behind; a replica set with transactions would close that.
 */
const checkout = async (user, items) => {
  const quantities = normaliseItems(items);
  const ids = [...quantities.keys()];
  const products = await Product.find({ _id: { $in: ids } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines = ids.map((id) => {
    const product = byId.get(id);
    if (!product) {
      throw new ValidationError(
        "A product in your cart is no longer available"
      );
    }
    const quantity = quantities.get(id);
    if (product.stock < quantity) {
      throw new ValidationError(
        product.stock === 0
          ? `${product.name} is out of stock`
          : `Only ${product.stock} of ${product.name} left in stock`
      );
    }
    return {
      product: product._id,
      name: product.name,
      img: product.img,
      price: product.price,
      quantity,
    };
  });

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  if (user.balance < total) {
    throw new ValidationError(
      "Your balance is too low for this order",
      "INSUFFICIENT_BALANCE"
    );
  }

  const reserved = [];
  for (const line of lines) {
    const { modifiedCount } = await Product.updateOne(
      { _id: line.product, stock: { $gte: line.quantity } },
      { $inc: { stock: -line.quantity } }
    );
    if (modifiedCount === 0) {
      await undo("release stock", () => releaseStock(reserved));
      throw new ValidationError(`${line.name} just sold out`);
    }
    reserved.push(line);
  }

  const charged = await User.findOneAndUpdate(
    { _id: user._id, balance: { $gte: total } },
    { $inc: { balance: -total } },
    { returnDocument: "after" }
  );
  if (!charged) {
    await undo("release stock", () => releaseStock(reserved));
    throw new ValidationError(
      "Your balance is too low for this order",
      "INSUFFICIENT_BALANCE"
    );
  }

  let order;
  try {
    order = await Order.create({ user: user._id, items: lines, total });
    await Transaction.create({
      user: user._id,
      type: "purchase",
      amount: -total,
      balanceAfter: charged.balance,
      order: order._id,
      description: `Order #${orderReference(order._id)}`,
    });
    return order.toObject();
  } catch (error) {
    // Never leave a paid order behind for a purchase that was refunded.
    if (order) await undo("delete order", () => order.deleteOne());
    await undo("refund balance", () =>
      User.updateOne({ _id: user._id }, { $inc: { balance: total } })
    );
    await undo("release stock", () => releaseStock(reserved));
    throw error;
  }
};

const listOrders = (user) =>
  Order.find({ user: user._id }).sort({ createdAt: -1, _id: -1 }).lean().exec();

module.exports = { MAX_QUANTITY, orderReference, checkout, listOrders };

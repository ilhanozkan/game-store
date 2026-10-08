const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const { useTestDatabase } = require("./helpers/db");
const {
  Category,
  Product,
  User,
  Order,
  Transaction,
} = require("../models");

useTestDatabase();

const validProduct = (overrides = {}) => ({
  name: "Test Mouse",
  category: "mouse",
  price: 1000,
  stock: 3,
  ...overrides,
});

const validUser = (overrides = {}) => ({
  name: "Ada",
  username: "ada",
  email: "ada@example.com",
  ...overrides,
});

const createUser = async (overrides = {}, password = "s3cret-password") => {
  const user = new User(validUser(overrides));
  await user.setPassword(password);
  return user.save();
};

describe("Category", () => {
  it("derives a slug from the name", async () => {
    const category = await Category.create({ name: "VR Glasses" });
    assert.equal(category.slug, "vr-glasses");
  });

  it("rejects duplicate slugs", async () => {
    await Category.create({ name: "Mouse", slug: "mouse" });
    await assert.rejects(
      Category.create({ name: "Mice", slug: "mouse" }),
      /duplicate key/
    );
  });
});

describe("Product", () => {
  it("derives a slug from the name and applies defaults", async () => {
    const product = await Product.create(
      validProduct({ name: "Logitech G305 Lightspeed!" })
    );
    assert.equal(product.slug, "logitech-g305-lightspeed");
    assert.equal(product.rating, 0);
    assert.deepEqual(product.specs.toObject(), []);
  });

  it("rejects negative prices", async () => {
    await assert.rejects(
      Product.create(validProduct({ price: -1 })),
      mongoose.Error.ValidationError
    );
  });

  it("rejects fractional or negative stock", async () => {
    await assert.rejects(
      Product.create(validProduct({ stock: 1.5 })),
      /whole number/
    );
    await assert.rejects(
      Product.create(validProduct({ stock: -1 })),
      mongoose.Error.ValidationError
    );
  });

  it("rejects ratings above five", async () => {
    await assert.rejects(
      Product.create(validProduct({ rating: 5.1 })),
      mongoose.Error.ValidationError
    );
  });

  it("requires the category to be a slug", async () => {
    await assert.rejects(
      Product.create(validProduct({ category: "VR Glasses!" })),
      mongoose.Error.ValidationError
    );
  });

  it("rejects duplicate slugs", async () => {
    await Product.create(validProduct());
    await assert.rejects(Product.create(validProduct()), /duplicate key/);
  });
});

describe("User", () => {
  it("hashes passwords and verifies them", async () => {
    const user = await createUser();
    assert.notEqual(user.passwordHash, "s3cret-password");
    assert.equal(await user.verifyPassword("s3cret-password"), true);
    assert.equal(await user.verifyPassword("wrong-password"), false);
  });

  it("rejects passwords shorter than eight characters", async () => {
    const user = new User(validUser());
    await assert.rejects(user.setPassword("short"), /at least 8/);
  });

  it("never selects or serialises the password hash by default", async () => {
    await createUser();
    const user = await User.findOne({ username: "ada" });
    assert.equal(user.passwordHash, undefined);

    const withHash = await User.findOne({ username: "ada" }).select(
      "+passwordHash"
    );
    assert.ok(withHash.passwordHash);
    assert.equal("passwordHash" in withHash.toJSON(), false);
  });

  it("normalises email and username and applies defaults", async () => {
    const user = await createUser({
      username: "  Ada_L ",
      email: " ADA@Example.com ",
    });
    assert.equal(user.username, "ada_l");
    assert.equal(user.email, "ada@example.com");
    assert.equal(user.role, "customer");
    assert.equal(user.balance, 0);
  });

  it("rejects invalid emails, usernames and roles", async () => {
    await assert.rejects(
      createUser({ email: "not-an-email" }),
      /Email address is invalid/
    );
    await assert.rejects(
      createUser({ username: "has spaces" }),
      /Username may only contain/
    );
    await assert.rejects(
      createUser({ role: "superuser" }),
      mongoose.Error.ValidationError
    );
  });

  it("rejects duplicate usernames and emails", async () => {
    await createUser();
    await assert.rejects(
      createUser({ email: "other@example.com" }),
      /duplicate key/
    );
    await assert.rejects(createUser({ username: "other" }), /duplicate key/);
  });
});

describe("Order", () => {
  it("requires at least one item", async () => {
    const user = await createUser();
    await assert.rejects(
      Order.create({ user: user._id, items: [], total: 0 }),
      /at least one item/
    );
  });

  it("requires whole, positive quantities", async () => {
    const user = await createUser();
    const product = await Product.create(validProduct());
    const item = { product: product._id, name: product.name, price: 1000 };

    await assert.rejects(
      Order.create({
        user: user._id,
        items: [{ ...item, quantity: 0 }],
        total: 0,
      }),
      mongoose.Error.ValidationError
    );

    const order = await Order.create({
      user: user._id,
      items: [{ ...item, quantity: 2 }],
      total: 2000,
    });
    assert.equal(order.status, "paid");
  });
});

describe("Transaction", () => {
  it("only accepts known transaction types", async () => {
    const user = await createUser();
    await assert.rejects(
      Transaction.create({
        user: user._id,
        type: "gift",
        amount: 10,
        balanceAfter: 10,
      }),
      mongoose.Error.ValidationError
    );
  });
});

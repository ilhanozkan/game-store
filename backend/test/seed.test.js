const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { useTestDatabase } = require("./helpers/db");
const { seedDatabase } = require("../db/seed");
const { Category, Product, User, Order, Transaction } = require("../models");
const categories = require("../data/categories.json");
const products = require("../data/products.json");
const users = require("../data/users.json");

const FRONTEND_PUBLIC = path.join(__dirname, "..", "..", "frontend", "public");
const hasFrontend = fs.existsSync(FRONTEND_PUBLIC);

useTestDatabase();

describe("seed data", () => {
  it("only references categories that exist", () => {
    const slugs = new Set(categories.map((c) => c.slug));
    products.forEach((product) =>
      assert.ok(slugs.has(product.category), `${product.slug} category`)
    );
  });

  it("uses unique product slugs", () => {
    const slugs = products.map((p) => p.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it(
    "points every product image at a file served by the frontend",
    { skip: !hasFrontend && "frontend/ is not checked out" },
    () => {
      products.forEach((product) => {
        const file = path.join(FRONTEND_PUBLIC, product.img);
        assert.ok(fs.existsSync(file), `${product.img} is missing`);
      });
    }
  );

  it("gives every category at least one product", () => {
    categories.forEach((category) =>
      assert.ok(
        products.some((p) => p.category === category.slug),
        `${category.slug} has no products`
      )
    );
  });
});

describe("seedDatabase", () => {
  it("creates categories, products and demo users", async () => {
    const summary = await seedDatabase();

    assert.deepEqual(summary, {
      categories: categories.length,
      products: products.length,
      usersCreated: users.length,
    });
    assert.equal(await Category.countDocuments(), categories.length);
    assert.equal(await Product.countDocuments(), products.length);
    assert.equal(await User.countDocuments(), users.length);
  });

  it("is idempotent and keeps existing users", async () => {
    await seedDatabase();
    const fola = await User.findOne({ username: "fola" });
    fola.balance = 1;
    await fola.save();

    const summary = await seedDatabase();

    assert.equal(summary.usersCreated, 0);
    assert.equal(await Product.countDocuments(), products.length);
    assert.equal((await User.findOne({ username: "fola" })).balance, 1);
  });

  it("creates users whose documented passwords work", async () => {
    await seedDatabase();

    await Promise.all(
      users.map(async ({ username, password, role }) => {
        const user = await User.findOne({ username }).select("+passwordHash");
        assert.equal(user.role, role);
        assert.equal(await user.verifyPassword(password), true);
      })
    );
  });

  it("resolves favorite slugs and records a welcome credit", async () => {
    await seedDatabase();
    const fola = await User.findOne({ username: "fola" }).populate("favorites");
    const expected = users.find((u) => u.username === "fola");

    assert.deepEqual(
      fola.favorites.map((p) => p.slug).sort(),
      [...expected.favorites].sort()
    );

    const credit = await Transaction.findOne({ user: fola._id });
    assert.equal(credit.type, "top-up");
    assert.equal(credit.amount, expected.balance);
    assert.equal(credit.balanceAfter, fola.balance);
  });

  it("can skip the demo users", async () => {
    const summary = await seedDatabase({ demoUsers: false });
    assert.equal(summary.usersCreated, 0);
    assert.equal(await User.countDocuments(), 0);
  });

  describe("with data from the previous schema", () => {
    // Products from before slugs existed, which break the unique index.
    const insertLegacyProducts = async () => {
      await Product.collection.drop().catch(() => {});
      await Product.collection.insertMany([
        { name: "Oculus Quest", category: "VR Glasses", price: 25000 },
        { name: "JBL One", category: "Headphones", price: 25000 },
      ]);
    };

    it("explains how to recover instead of failing obscurely", async () => {
      await insertLegacyProducts();
      await assert.rejects(seedDatabase(), /npm run seed -- --reset/);

      // Leave the collection with its indexes for the following tests.
      await Product.collection.drop();
      await Product.createIndexes();
    });

    it("recovers when reset is requested", async () => {
      await insertLegacyProducts();
      const summary = await seedDatabase({ reset: true });

      assert.equal(summary.products, products.length);
      assert.equal(await Product.countDocuments(), products.length);
      await assert.rejects(
        Product.create({
          name: "Duplicate",
          slug: products[0].slug,
          category: "mouse",
          price: 1,
          stock: 1,
        }),
        /duplicate key/
      );
    });
  });

  it("wipes existing data when reset is requested", async () => {
    await seedDatabase();
    const user = await User.findOne({ username: "fola" });
    const product = await Product.findOne();
    await Order.create({
      user: user._id,
      items: [
        {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ],
      total: product.price,
    });

    const summary = await seedDatabase({ reset: true });

    assert.equal(summary.usersCreated, users.length);
    assert.equal(await Order.countDocuments(), 0);
  });
});

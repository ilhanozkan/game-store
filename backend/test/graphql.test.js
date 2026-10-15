const { describe, it, mock } = require("node:test");
const assert = require("node:assert/strict");

const jwt = require("jsonwebtoken");

const { useTestApp, errorCode } = require("./helpers/app");
const config = require("../config");
const { Product, User, Order, Transaction } = require("../models");

const api = useTestApp();

const productId = async (slug) => String((await Product.findOne({ slug }))._id);

const CHECKOUT = `
  mutation ($items: [CartItemInput!]!) {
    checkout(items: $items) {
      _id
      reference
      total
      itemCount
      status
      items { productId name price quantity subtotal }
    }
  }
`;

describe("catalog queries", () => {
  it("lists products with category names and stock flags", async () => {
    const { data } = await api.graphql(`
      {
        products(category: "gamepads") {
          name category categorySlug inStock isFavorite createdAt
        }
      }
    `);

    assert.deepEqual(
      data.products.map(({ name, category, categorySlug, inStock }) => ({
        name,
        category,
        categorySlug,
        inStock,
      })),
      [
        {
          name: "Defender X7",
          category: "GamePads",
          categorySlug: "gamepads",
          inStock: true,
        },
        {
          name: "Defender XB",
          category: "GamePads",
          categorySlug: "gamepads",
          inStock: false,
        },
      ]
    );
    assert.equal(data.products[0].isFavorite, false);
    assert.ok(!Number.isNaN(Date.parse(data.products[0].createdAt)));
  });

  it("returns an empty list for unknown categories", async () => {
    const { data } = await api.graphql(
      `{ products(category: "toasters") { _id } }`
    );
    assert.deepEqual(data.products, []);
  });

  it("treats an explicit null sort as the default order", async () => {
    const { data, errors } = await api.graphql(
      `{ products(sort: null) { slug } }`
    );
    assert.equal(errors, undefined);
    assert.equal(data.products[0].slug, "oculus-quest-2");
  });

  it("supports search and sorting", async () => {
    const { data } = await api.graphql(`
      { products(search: "logi", sort: PRICE_DESC) { name } }
    `);
    assert.deepEqual(
      data.products.map((p) => p.name),
      ["Logitech G305"]
    );

    const rated = await api.graphql(`{ products(sort: RATING) { rating } }`);
    const ratings = rated.data.products.map((p) => p.rating);
    assert.deepEqual(
      ratings,
      [...ratings].sort((a, b) => b - a)
    );
  });

  it("looks up a product by slug or id", async () => {
    const query = `
      query ($id: ID!) { product(id: $id) { _id name specs { label value } } }
    `;
    const bySlug = await api.graphql(query, { id: "jbl-quantum-one" });
    assert.equal(bySlug.data.product.name, "JBL Quantum One");
    assert.ok(bySlug.data.product.specs.length > 0);

    const byId = await api.graphql(query, { id: bySlug.data.product._id });
    assert.equal(byId.data.product.name, "JBL Quantum One");

    const missing = await api.graphql(query, { id: "nope" });
    assert.equal(missing.data.product, null);
  });

  it("keeps the deprecated productsByCategory query working", async () => {
    const { data } = await api.graphql(
      `{ productsByCategory(category: "VR Glasses") { name } }`
    );
    assert.deepEqual(data.productsByCategory, [{ name: "Oculus Quest 2" }]);
  });

  it("lists categories with product counts", async () => {
    const { data } = await api.graphql(
      `{ categories { slug productCount } category(slug: "games") { name } }`
    );
    assert.deepEqual(data.categories[0], { slug: "mouse", productCount: 2 });
    assert.equal(data.category.name, "Games");
  });
});

describe("authentication", () => {
  const REGISTER = `
    mutation ($input: RegisterInput!) {
      register(input: $input) { token user { username email role balance } }
    }
  `;
  const ME = `{ me { username } }`;
  const newUser = {
    name: "Ada Lovelace",
    username: "ada",
    email: "Ada@Example.com",
    password: "analytical-engine",
  };

  it("registers a customer and returns a working token", async () => {
    const { data } = await api.graphql(REGISTER, { input: newUser });
    assert.deepEqual(data.register.user, {
      username: "ada",
      email: "ada@example.com",
      role: "CUSTOMER",
      balance: 0,
    });

    const me = await api.graphql(ME, {}, data.register.token);
    assert.equal(me.data.me.username, "ada");
  });

  it("rejects duplicate usernames and weak passwords", async () => {
    const duplicate = await api.graphql(REGISTER, {
      input: { ...newUser, username: "fola" },
    });
    assert.equal(errorCode(duplicate), "CONFLICT");
    assert.match(duplicate.errors[0].message, /username is already taken/);

    const weak = await api.graphql(REGISTER, {
      input: { ...newUser, password: "short" },
    });
    assert.equal(errorCode(weak), "BAD_USER_INPUT");
  });

  it("logs in with a username or email", async () => {
    assert.ok(await api.login("fola", "gamestore123"));
    assert.ok(await api.login("FOLA@example.com", "gamestore123"));
  });

  it("rejects bad credentials without revealing which part was wrong", async () => {
    const query = `
      mutation ($input: LoginInput!) { login(input: $input) { token } }
    `;
    const wrongPassword = await api.graphql(query, {
      input: { identifier: "fola", password: "nope-nope" },
    });
    const unknownUser = await api.graphql(query, {
      input: { identifier: "ghost", password: "nope-nope" },
    });

    assert.equal(errorCode(wrongPassword), "UNAUTHENTICATED");
    assert.equal(
      wrongPassword.errors[0].message,
      unknownUser.errors[0].message
    );
  });

  it("treats missing or invalid tokens as signed out", async () => {
    assert.equal((await api.graphql(ME)).data.me, null);
    assert.equal((await api.graphql(ME, {}, "not-a-jwt")).data.me, null);

    const fola = await User.findOne({ username: "fola" });
    const unsigned = jwt.sign({ sub: String(fola._id) }, null, {
      algorithm: "none",
    });
    const wrongKey = jwt.sign({ sub: String(fola._id) }, "x".repeat(40));
    assert.equal((await api.graphql(ME, {}, unsigned)).data.me, null);
    assert.equal((await api.graphql(ME, {}, wrongKey)).data.me, null);
  });

  it("accepts the Bearer scheme in any case", async () => {
    const token = await api.loginAsCustomer();
    const res = await api
      .request()
      .post("/graphql")
      .set("Authorization", `bearer ${token}`)
      .send({ query: ME });
    assert.equal(res.body.data.me.username, "fola");
  });

  it("never exposes password hashes", async () => {
    const { errors } = await api.graphql(`{ me { passwordHash } }`);
    assert.match(errors[0].message, /Cannot query field "passwordHash"/);
  });
});

describe("account mutations", () => {
  it("requires sign-in", async () => {
    const id = await productId("logitech-g305");
    const res = await api.graphql(
      `mutation ($id: ID!) { toggleFavorite(productId: $id) { _id } }`,
      { id }
    );
    assert.equal(errorCode(res), "UNAUTHENTICATED");
  });

  it("toggles favorites and reflects them on products", async () => {
    const token = await api.loginAsCustomer();
    const id = await productId("neon-drift");
    const toggle = `
      mutation ($id: ID!) {
        toggleFavorite(productId: $id) { favorites favoriteProducts { slug } }
      }
    `;

    const added = await api.graphql(toggle, { id }, token);
    assert.ok(added.data.toggleFavorite.favorites.includes(id));
    assert.equal(
      added.data.toggleFavorite.favoriteProducts[0].slug,
      "neon-drift"
    );

    const product = await api.graphql(
      `query ($id: ID!) { product(id: $id) { isFavorite } }`,
      { id },
      token
    );
    assert.equal(product.data.product.isFavorite, true);

    const removed = await api.graphql(toggle, { id }, token);
    assert.ok(!removed.data.toggleFavorite.favorites.includes(id));
  });

  it("resolves isFavorite from the updated user in the same response", async () => {
    const token = await api.loginAsCustomer();
    const id = await productId("hollow-keep");
    const { data } = await api.graphql(
      `mutation ($id: ID!) {
        toggleFavorite(productId: $id) { favoriteProducts { slug isFavorite } }
      }`,
      { id },
      token
    );
    const added = data.toggleFavorite.favoriteProducts.find(
      (p) => p.slug === "hollow-keep"
    );
    assert.equal(added.isFavorite, true);
  });

  it("reports unknown products when toggling favorites", async () => {
    const token = await api.loginAsCustomer();
    const res = await api.graphql(
      `mutation { toggleFavorite(productId: "nope") { _id } }`,
      {},
      token
    );
    assert.equal(errorCode(res), "NOT_FOUND");
  });

  it("tops up the balance and records the transaction", async () => {
    const token = await api.loginAsCustomer();
    const { data } = await api.graphql(
      `mutation { topUpBalance(amount: 25000) { balance } }`,
      {},
      token
    );
    assert.equal(data.topUpBalance.balance, 525000);

    const history = await api.graphql(
      `{ myTransactions { type amount balanceAfter description } }`,
      {},
      token
    );
    assert.deepEqual(history.data.myTransactions[0], {
      type: "TOP_UP",
      amount: 25000,
      balanceAfter: 525000,
      description: "Wallet top-up",
    });
  });

  it("keeps the balance and ledger in step if the ledger write fails", async () => {
    const token = await api.loginAsCustomer();
    mock.method(console, "error", () => {});
    mock.method(Transaction, "create", async () => {
      throw new Error("ledger unavailable");
    });
    try {
      const res = await api.graphql(
        `mutation { topUpBalance(amount: 1000) { balance } }`,
        {},
        token
      );
      assert.equal(errorCode(res), "INTERNAL_SERVER_ERROR");
    } finally {
      mock.restoreAll();
    }
    assert.equal((await User.findOne({ username: "fola" })).balance, 500000);
  });

  it("refuses top-ups when the demo wallet is disabled", async () => {
    const token = await api.loginAsCustomer();
    config.demoWallet = false;
    try {
      const res = await api.graphql(
        `mutation { topUpBalance(amount: 1000) { balance } }`,
        {},
        token
      );
      assert.equal(errorCode(res), "FORBIDDEN");
    } finally {
      config.demoWallet = true;
    }
  });

  it("rejects invalid top-up amounts", async () => {
    const token = await api.loginAsCustomer();
    await Promise.all(
      [0, -100, 5000001].map(async (amount) => {
        const res = await api.graphql(
          `mutation ($amount: Int!) { topUpBalance(amount: $amount) { balance } }`,
          { amount },
          token
        );
        assert.equal(errorCode(res), "BAD_USER_INPUT");
      })
    );
  });

  it("updates the profile with validation", async () => {
    const token = await api.loginAsCustomer();
    const query = `
      mutation ($input: UpdateProfileInput!) {
        updateProfile(input: $input) { name email }
      }
    `;
    const { data } = await api.graphql(
      query,
      { input: { name: "Fola A." } },
      token
    );
    assert.equal(data.updateProfile.name, "Fola A.");

    const taken = await api.graphql(
      query,
      { input: { email: "admin@example.com" } },
      token
    );
    assert.equal(errorCode(taken), "CONFLICT");

    const invalid = await api.graphql(
      query,
      { input: { email: "nope" } },
      token
    );
    assert.equal(errorCode(invalid), "BAD_USER_INPUT");
  });
});

describe("checkout", () => {
  it("charges the balance, reduces stock and records the order", async () => {
    const token = await api.loginAsCustomer();
    const mouse = await productId("logitech-g305");
    const game = await productId("neon-drift");

    const { data, errors } = await api.graphql(
      CHECKOUT,
      {
        items: [
          { productId: mouse, quantity: 1 },
          { productId: game, quantity: 1 },
          { productId: mouse, quantity: 1 },
        ],
      },
      token
    );

    assert.equal(errors, undefined);
    assert.equal(data.checkout.total, 2 * 59000 + 45000);
    assert.equal(data.checkout.itemCount, 3);
    assert.equal(data.checkout.items.length, 2, "duplicate lines are merged");
    assert.equal(data.checkout.items[0].subtotal, 118000);
    assert.match(data.checkout.reference, /^[A-F0-9]{6}$/);

    const fola = await User.findOne({ username: "fola" });
    assert.equal(fola.balance, 500000 - 163000);
    assert.equal((await Product.findById(mouse)).stock, 16);

    const purchase = await Transaction.findOne({ type: "purchase" });
    assert.equal(purchase.amount, -163000);
    assert.equal(purchase.balanceAfter, fola.balance);
    assert.equal(String(purchase.order), data.checkout._id);

    const orders = await api.graphql(`{ myOrders { _id total } }`, {}, token);
    assert.equal(orders.data.myOrders[0]._id, data.checkout._id);
  });

  it("refuses orders the balance cannot cover and changes nothing", async () => {
    const token = await api.loginAsCustomer();
    const pc = await productId("pc-builder-tower");

    const res = await api.graphql(
      CHECKOUT,
      { items: [{ productId: pc, quantity: 1 }] },
      token
    );

    assert.equal(errorCode(res), "INSUFFICIENT_BALANCE");
    assert.equal((await Product.findById(pc)).stock, 2);
    assert.equal((await User.findOne({ username: "fola" })).balance, 500000);
    assert.equal(await Order.countDocuments(), 0);
  });

  it("refuses out-of-stock and over-stock quantities", async () => {
    const token = await api.loginAsCustomer();
    const soldOut = await api.graphql(
      CHECKOUT,
      { items: [{ productId: await productId("defender-xb"), quantity: 1 }] },
      token
    );
    assert.equal(errorCode(soldOut), "BAD_USER_INPUT");
    assert.match(soldOut.errors[0].message, /out of stock/);

    const tooMany = await api.graphql(
      CHECKOUT,
      {
        items: [{ productId: await productId("jbl-quantum-one"), quantity: 9 }],
      },
      token
    );
    assert.match(tooMany.errors[0].message, /Only 8 of JBL Quantum One left/);
  });

  it("validates cart contents", async () => {
    const token = await api.loginAsCustomer();
    const empty = await api.graphql(CHECKOUT, { items: [] }, token);
    assert.match(empty.errors[0].message, /cart is empty/);

    const zero = await api.graphql(
      CHECKOUT,
      { items: [{ productId: await productId("defender-x7"), quantity: 0 }] },
      token
    );
    assert.equal(errorCode(zero), "BAD_USER_INPUT");

    const unknown = await api.graphql(
      CHECKOUT,
      { items: [{ productId: "000000000000000000000000", quantity: 1 }] },
      token
    );
    assert.match(unknown.errors[0].message, /no longer available/);
  });

  it("never sells the same last unit twice", async () => {
    const admin = await User.findOne({ username: "admin" });
    admin.balance = 10000000;
    await admin.save();
    const fola = await User.findOne({ username: "fola" });
    fola.balance = 10000000;
    await fola.save();

    const pc = await productId("pc-builder-tower");
    const items = [{ productId: pc, quantity: 2 }];
    // Sign in first so both checkouts really run at the same time and the
    // loser is stopped by the atomic stock update, not the early check.
    const customerToken = await api.loginAsCustomer();
    const adminToken = await api.loginAsAdmin();
    const results = await Promise.all([
      api.graphql(CHECKOUT, { items }, customerToken),
      api.graphql(CHECKOUT, { items }, adminToken),
    ]);

    const failed = results.filter((res) => res.errors);
    assert.equal(failed.length, 1);
    assert.match(failed[0].errors[0].message, /sold out|out of stock/);
    assert.equal((await Product.findById(pc)).stock, 0);
    assert.equal(await Order.countDocuments(), 1);
  });

  it("releases reserved stock when the balance runs out mid-checkout", async () => {
    // Two orders the balance can only cover one of, placed simultaneously.
    const token = await api.loginAsCustomer();
    const vr = await productId("oculus-quest-2");
    const items = [{ productId: vr, quantity: 1 }];

    const results = await Promise.all([
      api.graphql(CHECKOUT, { items }, token),
      api.graphql(CHECKOUT, { items }, token),
    ]);

    assert.equal(results.filter((res) => res.errors).length, 1);
    assert.equal((await Product.findById(vr)).stock, 9);
    assert.equal((await User.findOne({ username: "fola" })).balance, 51000);
    assert.equal(await Order.countDocuments(), 1);
  });

  it("undoes the order, charge and stock if recording it fails", async () => {
    const token = await api.loginAsCustomer();
    const mouse = await productId("logitech-g305");
    mock.method(console, "error", () => {});
    mock.method(Transaction, "create", async () => {
      throw new Error("ledger unavailable");
    });

    try {
      const res = await api.graphql(
        CHECKOUT,
        { items: [{ productId: mouse, quantity: 1 }] },
        token
      );
      assert.equal(errorCode(res), "INTERNAL_SERVER_ERROR");
    } finally {
      mock.restoreAll();
    }

    assert.equal(await Order.countDocuments(), 0);
    assert.equal((await User.findOne({ username: "fola" })).balance, 500000);
    assert.equal((await Product.findById(mouse)).stock, 18);
  });

  it("reports order status as an enum", async () => {
    const token = await api.loginAsCustomer();
    const { data } = await api.graphql(
      `mutation ($items: [CartItemInput!]!) { checkout(items: $items) { status } }`,
      { items: [{ productId: await productId("neon-drift"), quantity: 1 }] },
      token
    );
    assert.equal(data.checkout.status, "PAID");
  });
});

describe("createProduct", () => {
  const CREATE = `
    mutation ($input: CreateProductInput!) {
      createProduct(input: $input) { slug category categorySlug price }
    }
  `;
  const input = {
    name: "Cyber Tag",
    category: "Games",
    price: 15000,
    stock: 999,
  };

  it("is restricted to admins", async () => {
    const res = await api.graphql(
      CREATE,
      { input },
      await api.loginAsCustomer()
    );
    assert.equal(errorCode(res), "FORBIDDEN");
  });

  it("creates products and rejects duplicates", async () => {
    const token = await api.loginAsAdmin();
    const { data } = await api.graphql(CREATE, { input }, token);
    assert.deepEqual(data.createProduct, {
      slug: "cyber-tag",
      category: "Games",
      categorySlug: "games",
      price: 15000,
    });

    const duplicate = await api.graphql(CREATE, { input }, token);
    assert.equal(errorCode(duplicate), "CONFLICT");
  });
});

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { useTestApp } = require("./helpers/app");
const products = require("../data/products.json");
const categories = require("../data/categories.json");

const api = useTestApp();

describe("REST API", () => {
  it("reports health", async () => {
    const res = await api.request().get("/api/health").expect(200);
    assert.deepEqual(res.body, { status: "ok", database: "up" });
  });

  it("lists categories in navigation order", async () => {
    const res = await api.request().get("/api/categories").expect(200);
    assert.deepEqual(
      res.body.map((c) => c.slug),
      categories.map((c) => c.slug)
    );
  });

  it("lists products in catalog order", async () => {
    const res = await api.request().get("/api/products").expect(200);
    assert.deepEqual(
      res.body.map((p) => p.slug),
      products.map((p) => p.slug)
    );
  });

  it("filters by category slug or name", async () => {
    const bySlug = await api.request().get("/api/products?category=vr-glasses");
    const byName = await api
      .request()
      .get("/api/products/category/VR%20Glasses");

    assert.deepEqual(
      bySlug.body.map((p) => p.slug),
      ["oculus-quest-2"]
    );
    assert.deepEqual(byName.body, bySlug.body);
  });

  it("searches, sorts and hides out-of-stock products on request", async () => {
    const search = await api.request().get("/api/products?search=DEFENDER");
    assert.deepEqual(search.body.map((p) => p.slug).sort(), [
      "defender-x7",
      "defender-xb",
    ]);

    const inStock = await api
      .request()
      .get("/api/products?search=defender&inStock=true");
    assert.deepEqual(
      inStock.body.map((p) => p.slug),
      ["defender-x7"]
    );

    const sorted = await api.request().get("/api/products?sort=price_asc");
    const prices = sorted.body.map((p) => p.price);
    assert.deepEqual(
      prices,
      [...prices].sort((a, b) => a - b)
    );
  });

  it("rejects overly long search terms", async () => {
    const res = await api
      .request()
      .get(`/api/products?search=${"a".repeat(101)}`);
    assert.equal(res.status, 400);
    assert.match(res.body.error.message, /limited to 100 characters/);
  });

  it("rejects unknown sort orders", async () => {
    const res = await api.request().get("/api/products?sort=cheapest");
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "BAD_USER_INPUT");
  });

  it("finds a product by slug or id and 404s otherwise", async () => {
    const bySlug = await api
      .request()
      .get("/api/products/logitech-g305")
      .expect(200);
    const byId = await api
      .request()
      .get(`/api/products/${bySlug.body._id}`)
      .expect(200);
    assert.equal(byId.body.name, "Logitech G305");

    const missing = await api.request().get("/api/products/nope").expect(404);
    assert.equal(missing.body.error.code, "NOT_FOUND");
    await api
      .request()
      .get("/api/products/000000000000000000000000")
      .expect(404);
  });

  describe("POST /api/products", () => {
    const newProduct = {
      name: "Razer Kishi",
      category: "gamepads",
      price: 99000,
      stock: 5,
      rating: 5,
    };

    it("requires a signed-in admin", async () => {
      await api.request().post("/api/products").send(newProduct).expect(401);

      const token = await api.loginAsCustomer();
      await api
        .request()
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(newProduct)
        .expect(403);
    });

    it("creates products for admins, ignoring store-managed fields", async () => {
      const token = await api.loginAsAdmin();
      const res = await api
        .request()
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(newProduct)
        .expect(201);

      assert.equal(res.body.slug, "razer-kishi");
      assert.equal(res.body.rating, 0);
    });

    it("validates the category and fields", async () => {
      const token = await api.loginAsAdmin();
      const unknownCategory = await api
        .request()
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...newProduct, category: "toasters" })
        .expect(400);
      assert.match(unknownCategory.body.error.message, /Unknown category/);

      await api
        .request()
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...newProduct, price: -5 })
        .expect(400);
    });
  });

  it("returns JSON errors for unknown routes and malformed bodies", async () => {
    const missing = await api.request().get("/api/nope").expect(404);
    assert.equal(missing.body.error.code, "NOT_FOUND");

    const token = await api.loginAsAdmin();
    const malformed = await api
      .request()
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send("{not json")
      .expect(400);
    assert.equal(malformed.body.error.code, "BAD_REQUEST");

    const charset = await api
      .request()
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json; charset=latin1")
      .send("{}");
    assert.equal(charset.status, 415);
    assert.equal(charset.body.error.code, "BAD_REQUEST");
  });

  it("answers malformed GraphQL bodies with GraphQL-shaped errors", async () => {
    const res = await api
      .request()
      .post("/graphql")
      .set("Content-Type", "application/json")
      .send("{not json")
      .expect(400);
    assert.equal(res.body.errors[0].extensions.code, "BAD_REQUEST");
  });
});

const express = require("express");
const mongoose = require("mongoose");

const productService = require("../services/productService");
const categoryService = require("../services/categoryService");
const { authenticate, adminOnly } = require("../middleware/auth");
const { NotFoundError } = require("../utils/errors");

const router = express.Router();

router.get("/health", (_req, res) => {
  const database = mongoose.connection.readyState === 1 ? "up" : "down";
  const healthy = database === "up";
  res
    .status(healthy ? 200 : 503)
    .json({ status: healthy ? "ok" : "degraded", database });
});

router.get("/categories", async (_req, res) => {
  res.json(await categoryService.listCategories());
});

// GET /api/products?category=mouse&search=logi&sort=PRICE_ASC&inStock=true
router.get("/products", async (req, res) => {
  const { category, search, sort, inStock } = req.query;
  res.json(
    await productService.listProducts({
      category,
      search,
      sort: sort ? String(sort).toUpperCase() : undefined,
      inStockOnly: inStock === "true",
    })
  );
});

router.get("/products/category/:category", async (req, res) => {
  res.json(
    await productService.listProducts({ category: req.params.category })
  );
});

router.get("/products/:idOrSlug", async (req, res) => {
  const product = await productService.getProduct(req.params.idOrSlug);
  if (!product) throw new NotFoundError("Product not found");
  res.json(product);
});

router.post("/products", authenticate, adminOnly, async (req, res) => {
  res.status(201).json(await productService.createProduct(req.body || {}));
});

module.exports = router;

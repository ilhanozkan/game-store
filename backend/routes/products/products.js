const express = require("express");

const ProductService = require("../../services/productService");

const router = express.Router();

router.get("/", async (req, res) => {
  const products = await ProductService.load();

  res.json(products);
});

router.get("/_id/:_id", async (req, res) => {
  const id = req.params._id;

  res.json(await ProductService.findById(id));
});

router.get("/category/:category", async (req, res) => {
  const { category } = req.params;

  const catProducts = await ProductService.find({
    category: { $regex: category, $options: "i" },
  });

  res.json(catProducts);
});

router.post("/", async (req, res) => {
  const product = await ProductService.insert(req.body);

  res.status(201).json(product);
});

module.exports = router;

const express = require("express");
const router = express.Router();

let dummyData = require("../../datasources/dummyData.json");
const Product = require("../../models/Product");

router.get("/", (req, res) => {
  res.json(dummyData);
});

router.post("/new", (req, res) => {
  const { name, category, price, stock, img, description, spesifications } =
    req.body;

  const testProd = new Product(
    name,
    category,
    price,
    stock,
    img,
    description,
    spesifications
  );

  dummyData = dummyData.concat(testProd);

  res.status(201).json({ message: "Product created" });
});

module.exports = router;

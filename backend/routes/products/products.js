const express = require("express");
const router = express.Router();

let dummyData = require("../../datasources/dummyData.json");
const Product = require("../../models/Product");

router.get("/", (req, res) => {
  res.json(dummyData);
});

router.get("/:id", (req, res) => {
  const id = req.params.id;

  res.json(dummyData.find((product) => product.id === id));
});

router.post("/new", (req, res) => {
  const {
    name,
    category,
    price,
    stock,
    img,
    description,
    spesifications,
    stars,
  } = req.body;

  const newProd = new Product(
    name,
    category,
    price,
    stock,
    stars,
    img,
    description,
    spesifications
  );

  dummyData = dummyData.concat(newProd);

  res.status(201).json({ message: "Product created" });
});

module.exports = { ProductsRoutes: router, dummyData };

const express = require("express");
const router = express.Router();
const product = require("../models/product");

router.get("/", (req, res) => {
  const minPrice = parseInt(req.query.minPrice);
  const maxPrice = parseInt(req.query.maxPrice);
  const brand = req.query.brand;

  let filter = {};

  if (minPrice && maxPrice) {
    filter = { price: { $gte: minPrice, $lte: maxPrice } };
  } else if (minPrice) {
    filter = { price: { $gte: minPrice } };
  } else if (maxPrice) {
    filter = { price: { $lte: maxPrice } };
  }

  if (brand) {
    filter = { $and: [filter, { brand: brand }] };
  }

  product
    .find(filter)
    .then((product) => {
      res.json({ product });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Error finding cells." });
    });
});

module.exports = router
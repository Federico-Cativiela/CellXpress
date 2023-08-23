const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const User = require("../models/user");

router.post("/reviews/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const { nickname, comment, num } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: `Producto con el id ${productId} no encontrado` });
    }

    // Calcular rate y reviewers en función de las revisiones previas
    const updatedRate = product.reviewers
      ? Math.ceil((product.rate * product.reviewers + num) / (product.reviewers + 1))
      : num;

    const updatedReviewers = product.reviewers ? product.reviewers + 1 : 1;

    // Crear la nueva revisión
    const newReview = {
      review: { nickname, comment, num },
    };

    // Actualizar el producto con la nueva revisión y los valores de rate y reviewers
    product.rating.push(newReview);
    product.rate = updatedRate;
    product.reviewers = updatedReviewers;

    await product.save();

    res.status(201).json({ message: "Review agregada correctamente", reviews: product.rating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor." });
  }
});

module.exports = router;





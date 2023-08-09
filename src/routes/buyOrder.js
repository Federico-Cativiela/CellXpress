const express = require("express");
const router = express.Router();
const BuyOrder = require("../models/buyOrder");
const Product = require("../models/product");

// Agregar un producto al carrito
router.post("/add-to-cart", async (req, res) => {
    const { userId, productId, quantity } = req.body;
  
    try {
      // Busca el producto en la base de datos para obtener su precio y cantidad disponible
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado." });
      }
  
      const productPrice = product.price;
  
      // Verifica si hay suficiente cantidad disponible del producto
      if (product.count < quantity) {
        return res.status(400).json({ message: "Cantidad insuficiente de producto." });
      }
  
      // Resta la cantidad del producto
      product.count -= quantity;
  
      // Guarda los cambios en el producto
      await product.save();
  
      // Continúa con la lógica para agregar el producto al carrito
      const existingCart = await BuyOrder.findOne({ userId });
  
      if (existingCart) {
        const existingProduct = existingCart.products.find(
          (item) => item.product.toString() === productId
        );
  
        if (existingProduct) {
          existingProduct.quantity += quantity;
        } else {
          existingCart.products.push({ product: productId, quantity });
        }
  
        existingCart.total += quantity * productPrice;
  
        const updatedCart = await existingCart.save();
        res.json(updatedCart);
      } else {
        const newCart = new BuyOrder({
          userId,
          products: [{ product: productId, quantity }],
          total: quantity * productPrice,
        });
  
        const savedCart = await newCart.save();
        res.json(savedCart);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Hubo un error en el servidor." });
    }
  });
  
  

// Ver el contenido del carrito
router.get("/cart/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await BuyOrder.findOne({ userId }).populate("products.product");

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor." });
  }
});

// Modificar la cantidad de productos en el carrito
router.put("/update-cart/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;
    const { quantity } = req.body;
  
    try {
      const existingCart = await BuyOrder.findOne({ userId });
  
      if (!existingCart) {
        return res.status(404).json({ message: "Carrito no encontrado." });
      }
  
      const existingProduct = existingCart.products.find(
        (item) => item.product.toString() === productId
      );
  
      if (!existingProduct) {
        return res.status(404).json({ message: "Producto no encontrado en el carrito." });
      }
  
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado." });
      }
  
      const originalQuantity = existingProduct.quantity;
      const productPrice = product.price;
  
      // Restablece la cantidad del producto en la base de datos antes de modificar el carrito
      product.count += originalQuantity;
      product.count -= quantity;
  
      // Actualiza el producto en la base de datos
      await product.save();
  
      // Actualiza la cantidad en el carrito
      existingProduct.quantity = quantity;
  
      // Actualiza el total del carrito
      existingCart.total += (quantity - originalQuantity) * productPrice;
  
      // Guarda los cambios en el carrito y devuelve la respuesta
      const updatedCart = await existingCart.save();
      res.json(updatedCart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Hubo un error en el servidor." });
    }
  });
  
// Eliminar un producto del carrito
router.delete("/remove-from-cart/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const existingCart = await BuyOrder.findOne({ userId });

    if (!existingCart) {
      return res.status(404).json({ message: "Carrito no encontrado." });
    }

    const existingProduct = existingCart.products.find(
      (item) => item.product.toString() === productId
    );

    if (!existingProduct) {
      return res.status(404).json({ message: "Producto no encontrado en el carrito." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    const productPrice = product.price;

    // Restablece la cantidad del producto en la base de datos antes de eliminarlo del carrito
    product.count += existingProduct.quantity;

    // Elimina el producto del carrito
    existingCart.products = existingCart.products.filter(
      (item) => item.product.toString() !== productId
    );

    // Actualiza el total del carrito
    existingCart.total -= existingProduct.quantity * productPrice;

    // Guarda los cambios en el carrito y devuelve la respuesta
    await existingCart.save();

    // Actualiza la cantidad del producto en la base de datos
    await product.save();

    res.json(existingCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor." });
  }
});


module.exports = router;

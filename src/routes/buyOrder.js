const express = require("express");
const router = express.Router();
const BuyOrder = require("../models/buyOrder");
const Product = require("../models/product");
const User = require("../models/user");
const stripe = require("stripe")("sk_test_51NccbYLQEdx2wACSJ21hlx0Y1Bx9j5eKHRyJqAnIjInB32qgNGW76bkPdP3Qt7JbcFc6UCaRkAV8LVhetHRAyRjx00SIUry2yX");

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

    // Busca la orden de compra pendiente del usuario
    let existingCart = await BuyOrder.findOne({ userId, status: "pending" });

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

router.get("/success/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    // Busca la orden de compra pendiente del usuario
    const pendingCart = await BuyOrder.findOne({ userId, status: "pending" });

    if (!pendingCart) {
      return res.status(404).json({ message: "No se encontró ninguna orden de compra pendiente." });
    }

    // Cambia el estado de la orden a "success"
    pendingCart.status = "success";
    await pendingCart.save();

    res.send("Compra exitosa. Tu orden de compra ha sido actualizada a 'success'.");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al mostrar el mensaje de éxito." });
  }
});


// Ruta para realizar el pago
router.post("/checkout", async (req, res) => {
  const { userId } = req.body;

  try {
    // Buscar el carrito pendiente del usuario
    const cart = await BuyOrder.findOne({ userId, status: "pending" }).populate("products.product");

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado o ya se realizó una compra exitosa." });
    }

    // Crear una lista de productos para la API de Stripe
    const lineItems = cart.products.map((item) => ({
      price_data: {
        currency: "usd",
        unit_amount: Math.floor(item.product.price * 100 / 500), // Dividir por el valor del dolar
        product_data: {
          name: item.product.title, // Nombre del producto
          description: item.product.description, // Descripción del producto
          images: [item.product.image], // Imagen del producto (si tienes una URL)
        },
      },
      quantity: item.quantity,
    }));

    // Crear una sesión de pago en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:3002/order/success/${userId}`,
      cancel_url: "http://localhost:3002/order/failure",
    });


    const paymentLink = session.url;
    res.json({ sessionId: session.id, paymentLink: paymentLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor" });
  }
});


router.get("/all", async (req, res) => {
  try {
    const allBuyOrders = await BuyOrder.find();
    res.json(allBuyOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor." });
  }
});


module.exports = router;

const express = require("express");
const router = express.Router();
const BuyOrder = require("../models/buyOrder");
const Product = require("../models/product");
const User = require("../models/user");
const stripe = require("stripe")(
  "sk_test_51NccbYLQEdx2wACSJ21hlx0Y1Bx9j5eKHRyJqAnIjInB32qgNGW76bkPdP3Qt7JbcFc6UCaRkAV8LVhetHRAyRjx00SIUry2yX"
);
const nodemailer = require("nodemailer");

// Configura el transporte de correo
const transporter = nodemailer.createTransport({
  service: "gmail", // Puedes usar un servicio de correo como Gmail o configurar tu propio servidor SMTP
  auth: {
    user: "infocxps@gmail.com", // Cambia esto al correo desde el que deseas enviar los correos
    pass: "lepbzffdfisdhhkc", // Cambia esto a tu contraseña
  },
});

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
      return res
        .status(400)
        .json({ message: "Cantidad insuficiente de producto." });
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

// Ver el contenido del carrito por buyOrder _id
router.get("/cart/:buyOrderId", async (req, res) => {
  const { buyOrderId } = req.params;

  try {
    const cart = await BuyOrder.findById(buyOrderId).populate(
      "products.product"
    );

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado." });
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor." });
  }
});

// Obtener todas las órdenes de compra por userId
router.get("/orders/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await BuyOrder.find({ userId }).populate("products.product");

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron ordenes con el id proporcionado" });
    }

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor" });
  }
});

//Obtener orden pendiente por medio de userId
router.get("/pendingOrders/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await BuyOrder.find({ userId, status: "pending" }).populate(
      "products.product"
    );

    if (orders.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron órdenes pendientes para el ID proporcionado",
      });
    }

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor" });
  }
});

//Obtener orden pendiente por medio de userId
router.get("/successOrders/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await BuyOrder.find({ userId, status: "success" }).populate(
      "products.product"
    );

    if (orders.length === 0) {
      return res.status(404).json({
        message: "No se encontraron órdenes exitosas para el ID proporcionado",
      });
    }

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor" });
  }
});

router.put("/update-cart/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  try {
    const existingCart = await BuyOrder.findOne({ userId, status: "pending" });

    if (!existingCart) {
      return res.status(404).json({ message: "Carrito no encontrado." });
    }

    const existingProduct = existingCart.products.find(
      (item) => item.product.toString() === productId
    );

    if (!existingProduct) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado en el carrito." });
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
router.delete("/remove-from-cart/:orderId/:productId", async (req, res) => {
  const { orderId, productId } = req.params;

  try {
    const existingCart = await BuyOrder.findById(orderId);

    if (!existingCart) {
      return res.status(404).json({ message: "Orden no encontrada." });
    }

    const existingProduct = existingCart.products.find(
      (item) => item.product.toString() === productId
    );

    if (!existingProduct) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado en la orden." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    const productPrice = product.price;

    // Restablece la cantidad del producto en la base de datos antes de eliminarlo de la orden
    product.count += existingProduct.quantity;

    // Elimina el producto de la orden
    existingCart.products = existingCart.products.filter(
      (item) => item.product.toString() !== productId
    );

    // Actualiza el total de la orden
    existingCart.total -= existingProduct.quantity * productPrice;

    // Guarda los cambios en la orden y devuelve la respuesta
    await existingCart.save();

    // Actualiza la cantidad del producto en la base de datos
    await product.save();

    res.json(existingCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor." });
  }
});

// Vaciar el carrito de un usuario
router.delete("/empty-cart/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Busca la orden de compra pendiente del usuario
    const existingCart = await BuyOrder.findOne({ userId, status: "pending" });

    if (!existingCart) {
      return res.status(404).json({ message: "Carrito no encontrado." });
    }

    // Restaura la cantidad de productos en la base de datos
    for (const item of existingCart.products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.count += item.quantity;
        await product.save();
      }
    }

    // Vacía el carrito de productos
    existingCart.products = [];
    existingCart.total = 0;

    // Guarda los cambios en el carrito
    await existingCart.save();

    res.json({ message: "Carrito vaciado exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor." });
  }
});

module.exports = router;

// Ruta para realizar el pago
router.post("/checkout", async (req, res) => {
  const { userId } = req.body;
  try {
    // Buscar el carrito pendiente del usuario
    const cart = await BuyOrder.findOne({ userId, status: "pending" }).populate(
      "products.product"
    );
    const user = await User.findById(userId);
    if (!cart) {
      return res.status(404).json({
        message: "Carrito no encontrado o ya se realizó una compra exitosa.",
      });
    }

    // Crear una lista de productos para la API de Stripe
    const lineItems = cart.products.map((item) => ({
      price_data: {
        currency: "usd",
        unit_amount: Math.floor((item.product.price * 100) / 500), // Dividir por el valor del dolar
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
      success_url: `/order/success/${cart._id}`, // Cambio aquí
      cancel_url: "/order/failure",
      customer_email: user.email,
    });

    const paymentLink = session.url;
    res.json({
      sessionId: session.id,
      paymentLink: paymentLink,
      lineItems: lineItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor" });
  }
});

router.get("/success/:buyOrderId", async (req, res) => {
  const { buyOrderId } = req.params;

  try {
    // Obtén los detalles del carrito directamente desde la base de datos por su ID
    const cart = await BuyOrder.findById(buyOrderId).populate(
      "products.product"
    );

    if (!cart) {
      return res
        .status(404)
        .json({ message: "No se encontró ninguna orden de compra pendiente." });
    }

    // Cambia el estado de la orden a "success"
    cart.status = "success";
    await cart.save();

    // Obtén los detalles del usuario
    const user = await User.findById(cart.userId);

    // Obtén la fecha actual en el formato deseado (por ejemplo, "15 de agosto de 2023")
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = currentDate.toLocaleDateString("es-ES", options);

    // Envía un correo electrónico de confirmación de compra
    const emailContent = `
<html>
<head>
  <style>
    body {
      background-color: #cfcfcf;
      color: #333;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 20px;
    }
    h1 {
      color: #e57373;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 10px;
      margin: 10px 0;
    }
    img {
      max-width: 200px;
      height: auto;
    }
  </style>
</head>
  <body>
    <h1>¡Gracias por tu compra en nuestra tienda!</h1>
    <h2>Detalles de la compra:</h2>
    <ul>
      ${cart.products
        .map(
          (item) =>
            `<li>
          ${item.quantity} x ${item.product.title} - Total: $${(
              item.product.price * item.quantity
            ).toFixed(2)}<br>
          <img src="${item.product.image}" alt="Imagen del producto"><br>
          ${item.product.description}
        </li>`
        )
        .join("")}
    </ul>
    <p>Fecha: ${formattedDate}</p>
    <p>¡Esperamos verte nuevamente pronto!</p>
  </body>
  </html>
`;

    const mailOptions = {
      from: "infocxps@gmail.com", // Cambia esto al correo desde el que deseas enviar el correo
      to: user.email, // El correo del usuario
      subject: "Confirmación de compra",
      html: emailContent,
    };

    // Envía el correo electrónico
    await transporter.sendMail(mailOptions);

    res.send(
      "Compra exitosa. Tu orden de compra ha sido actualizada a 'success'."
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al mostrar el mensaje de éxito." });
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

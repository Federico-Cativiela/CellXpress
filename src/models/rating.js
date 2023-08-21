const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Referencia al modelo de usuarios si deseas asociar el carrito a un usuario
    required: false,
  },
  buyOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "buyOrder", // Referencia al modelo de usuarios si deseas asociar el carrito a un usuario
    required: false,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Referencia al modelo de productos
        required: false,
      },
     
    },
  ],
  qualify: {
    type: Number,
    required: false,
  },
  comment: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
 
});

module.exports = mongoose.model("rating", ratingSchema);

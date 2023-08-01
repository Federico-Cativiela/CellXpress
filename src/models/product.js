const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  }, 
  image: {
    type: String,
    required: true,
  },
  rating: {
    type: Array,
    required: false,
  },
  count: {
    type: Number,
    default: 0,
    required: false,
  }
});
productSchema.index({ title: "text" }); // Definir índice de texto en el campo "title"

module.exports = mongoose.model("Product", productSchema);
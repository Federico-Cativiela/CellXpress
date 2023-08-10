const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  UID: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  purchaseHistory: [
    {
      cart: {
        type: mongoose.Types.ObjectId,
        ref: "BuyOrder",
      },
      date: {
        type: Date,
        default: Date.now,
      },
      products: [
        {
          product: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
      total: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        required: true,
      },
      // Otros campos que quieras incluir en la compra
    },
  ],
}, {
  versionKey: false
});

// Antes de guardar un nuevo usuario, asigna automáticamente el _id generado por Mongoose al campo UID
userSchema.pre("save", function(next) {
  this.UID = this._id;
  next();
});

module.exports = mongoose.model("User", userSchema);

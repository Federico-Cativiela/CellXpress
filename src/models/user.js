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
}, {
  versionKey: false
});

// Antes de guardar un nuevo usuario, asigna automáticamente el _id generado por Mongoose al campo UID
userSchema.pre("save", function(next) {
  this.UID = this._id;
  next();
});

module.exports = mongoose.model("User", userSchema);

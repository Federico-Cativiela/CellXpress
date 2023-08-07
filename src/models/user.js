const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const userSchema = mongoose.Schema({
  UID:{
    type:String,
    default: uuidv4,
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
    requires: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  admin:{
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
},{
  versionKey: false
});

module.exports = mongoose.model("User", userSchema);
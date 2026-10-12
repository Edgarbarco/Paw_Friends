const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true,},
  stock: { type: Number, required: true,},
  category: { type: String, required: true,},
  type: { type: String, required: true },
  quantity: { type: Number, required: true },
  entryDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);

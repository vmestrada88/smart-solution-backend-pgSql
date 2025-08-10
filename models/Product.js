const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true, default: 0 },
  priceSell: { type: Number, required: true },
  priceBuy: { type: Number, required: true },
  category: String,
  imageUrls: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);

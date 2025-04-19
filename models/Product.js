const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, index: true },
  category: { type: String, index: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);

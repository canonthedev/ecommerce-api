const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all orders for the logged-in user (admin can get all)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find().populate('user', 'username email').populate('products.product');
    } else {
      orders = await Order.find({ user: req.user.id }).populate('products.product');
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get order by ID (only owner or admin)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }

    // Calculate total price and check stock
    let totalPrice = 0;
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(400).json({ message: `Product not found: ${item.product}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }
      totalPrice += product.price * item.quantity;
    }

    // Deduct stock
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    const order = new Order({
      user: req.user.id,
      products,
      totalPrice,
      status: 'pending'
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update order status (admin only)
router.put('/:id/status', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

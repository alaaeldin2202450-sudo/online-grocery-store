const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// Create Order API
const createOrder = async (req, res) => {
  try {
    const { userId, items, paymentMethod, deliveryAddress } = req.body;

  console.log( { userId, items, paymentMethod, deliveryAddress }  )

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    let totalPrice = 0;

    // Verify product availability and calculate the total price (recalculate prices server-side)
    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: "Invalid item in order" });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      // Use the product price from DB to avoid client tampering
      const linePrice = product.price * item.quantity;
      totalPrice += linePrice;

      // ensure the item.price stored reflects server-calculated price
      item.price = product.price;
    }

    // Deduct product quantities in the database
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity },
      });
    }

    // Create a new order
    const newOrder = new Order({
      user: userId,
      items: items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: (item.price || 0) * item.quantity,
      })),
      totalPrice,
      paymentMethod,
      deliveryAddress,
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();

    // Empty the user's cart
    user.cart.items = [];
    await user.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder,
    });

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createOrder };

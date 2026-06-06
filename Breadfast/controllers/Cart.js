const User = require("../models/user");
const Product = require("../models/product");

const addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product) {
      return res.status(404).json({ message: "User or Product not found" });
    }

    const price = product.price;

    await user.addToCart(product, quantity, price);
    res.status(200).json({ message: "Item added to cart" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
};

const updateCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const itemIndex = user.cart.items.findIndex((item) =>
      item.product.equals(productId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const item = user.cart.items[itemIndex];
    const pricePerUnit = item.price / item.quantity;

    item.quantity = quantity;
    item.price = pricePerUnit * quantity;

    user.cart.totalPrice = user.cart.items.reduce(
      (total, item) => total + item.price,
      0
    );

    await user.save();

    res.status(200).json({ message: "Cart updated", cart: user.cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};

module.exports = { addToCart, updateCart };

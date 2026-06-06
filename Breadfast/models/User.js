const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Cart Schema
const cartSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false } // Prevents generating separate ObjectId for each cart item
);

// Updated User Schema
const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["user", "admin"],
      default: "user",
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    cart: {
      items: [cartSchema],
      totalPrice: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add item to cart
userSchema.methods.addToCart = async function (product, quantity, price) {
  const existingItem = this.cart.items.find((item) =>
    item.product.equals(product._id)
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price += price * quantity;
  } else {
    this.cart.items.push({
      product: product._id,
      quantity,
      price: price * quantity,
    });
  }

  this.cart.totalPrice += price * quantity;
  return this.save();
};

// Remove item from cart
userSchema.methods.removeFromCart = async function (productId) {
  const itemIndex = this.cart.items.findIndex((item) =>
    item.product.equals(productId)
  );

  if (itemIndex > -1) {
    const item = this.cart.items[itemIndex];
    this.cart.totalPrice -= item.price;
    this.cart.items.splice(itemIndex, 1);
  }

  return this.save();
};

// Prevent model overwrite
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;

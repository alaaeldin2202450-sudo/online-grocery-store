const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Bakeries & Pastries",
        "Dairy",
        "Fruits and Veggies",
        "Snacks",
        "Behind the Counter",
        "Beverages",
        "Beauty Essentials",
      ],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default : "/img/placeholder.png"
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;

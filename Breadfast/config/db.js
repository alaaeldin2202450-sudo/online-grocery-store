const mongoose = require("mongoose");
require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
const Product = require("../models/Product");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/grocery_db";

mongoose.set("strictQuery", false);

let inMemoryServer = null;

const sampleProducts = [
  {
    name: "Fresh Milk",
    category: "Dairy",
    price: 35,
    quantity: 40,
    description: "Fresh full-fat milk.",
    imageUrl: "/img/placeholder.png",
  },
  {
    name: "Butter Croissant",
    category: "Bakeries & Pastries",
    price: 25,
    quantity: 50,
    description: "Buttery and flaky croissant.",
    imageUrl: "/img/placeholder.png",
  },
  {
    name: "Bananas",
    category: "Fruits and Veggies",
    price: 18,
    quantity: 100,
    description: "Fresh ripe bananas.",
    imageUrl: "/img/placeholder.png",
  },
  {
    name: "Potato Chips",
    category: "Snacks",
    price: 20,
    quantity: 75,
    description: "Classic salted chips.",
    imageUrl: "/img/placeholder.png",
  },
];

async function seedProductsIfEmpty() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(sampleProducts);
    console.log("Seeded sample products.");
  }
}

async function startInMemoryServer() {
  try {
    inMemoryServer = await MongoMemoryServer.create();
    const uri = inMemoryServer.getUri();
    const opts = { useNewUrlParser: true, useUnifiedTopology: true };
    await mongoose.connect(uri, opts);
    console.log("Connected to in-memory MongoDB for local demo.");
    await seedProductsIfEmpty();
  } catch (err) {
    console.error("Failed to start in-memory MongoDB:", err.message);
  }
}

async function connectDB() {
  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    await mongoose.connect(MONGO_URI, options);
    console.log(`MongoDB connected: ${MONGO_URI}`);
    const count = await Product.countDocuments();
    console.log(`Found ${count} products in database.`);
    if (count === 0) {
      await seedProductsIfEmpty();
    }
  } catch (err) {
    console.error("mongodb connection failed!", err.message);
    console.warn("Falling back to in-memory MongoDB for local demo.");
    await startInMemoryServer();
  }
}

module.exports = connectDB;

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const csv = require("csv-parser");
const Product = require("../models/Product");

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

function normalize(value) {
  return value ? value.toString().trim() : "";
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null) return fallback;
  const cleaned = value.toString().replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function mapProduct(row) {
  const name = normalize(row.name || row.product_name || row.title || row.title_name || row.item_name);
  const category = normalize(row.category || row.department || row.aisle || row.type || row.group || "Other");
  const price = toNumber(row.price || row.unit_price || row.retail_price || row.price_usd || row.cost, 0);
  const quantity = Math.max(0, Math.round(toNumber(row.quantity || row.stock || row.in_stock || row.count || row.inventory, 10)));
  const description = normalize(row.description || row.details || row.summary || row.info || "");
  const imageUrl = normalize(row.imageUrl || row.image_url || row.image || row.picture || row.img || row.photo) || "/img/placeholder.png";

  return {
    name: name || "Unknown product",
    category: category || "Other",
    price,
    quantity,
    description,
    imageUrl,
  };
}

async function connect() {
  if (!MONGO_URI || MONGO_URI.trim() === "") {
    throw new Error("MONGO_URI is not set. Add it to your .env file before importing.");
  }
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function importCsv(filePath) {
  return new Promise((resolve, reject) => {
    const products = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        products.push(mapProduct(row));
      })
      .on("end", () => resolve(products))
      .on("error", reject);
  });
}

async function importJson(filePath) {
  const raw = await fs.promises.readFile(filePath, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("JSON dataset must contain an array of products.");
  }
  return data.map(mapProduct);
}

async function run() {
  const filePath = process.argv[2] || process.env.PRODUCT_DATA_FILE;
  if (!filePath) {
    console.error("Usage: npm run import-products -- ./path/to/products.csv");
    process.exit(1);
  }

  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const ext = path.extname(absolutePath).toLowerCase();
  let products = [];

  if (ext === ".csv") {
    products = await importCsv(absolutePath);
  } else if (ext === ".json") {
    products = await importJson(absolutePath);
  } else {
    throw new Error("Unsupported file type. Use .csv or .json.");
  }

  if (products.length === 0) {
    console.error("No products found in the dataset.");
    process.exit(1);
  }

  await connect();
  console.log(`Connected to MongoDB. Importing ${products.length} products...`);

  const inserted = await Product.insertMany(products, { ordered: false }).catch((err) => {
    if (err && err.insertedDocs) {
      return err.insertedDocs;
    }
    throw err;
  });

  console.log(`Imported ${Array.isArray(inserted) ? inserted.length : products.length} products successfully.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Import failed:", err.message);
  process.exit(1);
});

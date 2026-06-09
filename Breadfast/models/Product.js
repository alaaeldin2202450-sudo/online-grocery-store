const mongoose = require("mongoose");
const {
  deriveCategory,
  getStock,
  formatPrice,
  parseProductImage,
} = require("../utils/productHelpers");

const productSchema = new mongoose.Schema(
  {
    productId: String,
    title: String,
    description: String,
    productImage: mongoose.Schema.Types.Mixed,
    packageSizing: String,
    pricing: {
      price: Number,
      displayPrice: String,
    },
    pricingUnits: mongoose.Schema.Types.Mixed,
  },
  {
    strict: false,
    collection: "products",
  }
);

productSchema.virtual("name").get(function () {
  return this.title || "Product";
});

productSchema.virtual("displayPrice").get(function () {
  return formatPrice(this);
});

productSchema.virtual("price").get(function () {
  return this.pricing?.price ?? 0;
});

productSchema.virtual("quantity").get(function () {
  return getStock(this);
});

productSchema.virtual("category").get(function () {
  return this.storedCategory || deriveCategory(this.title || "");
});

productSchema.virtual("imageUrl").get(function () {
  return parseProductImage(this.productImage);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;

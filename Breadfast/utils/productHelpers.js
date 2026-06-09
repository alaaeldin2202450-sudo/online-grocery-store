const PLACEHOLDER_IMAGE = "/img/placeholder.png";
const IMAGE_FIELD_PRIORITY = ["largeUrl", "mediumUrl", "imageUrl", "smallUrl", "thumbnailUrl", "extraLargeUrl"];

const CATEGORY_RULES = [
  { category: "Fruits & Veggies", keywords: ["tomato", "banana", "apple", "orange", "lettuce", "carrot", "onion", "potato", "pepper", "avocado", "berry", "grape", "melon", "cucumber", "broccoli", "spinach", "mango", "lemon", "lime", "pear", "peach", "plum", "celery", "mushroom", "garlic", "herb", "salad", "vegetable", "fruit"] },
  { category: "Dairy", keywords: ["milk", "cheese", "butter", "yogurt", "cream", "egg", "cheddar", "mozzarella", "cottage"] },
  { category: "Bakeries & Pastries", keywords: ["bread", "bagel", "croissant", "muffin", "cake", "cookie", "pastry", "roll", "bun", "donut", "waffle", "pancake"] },
  { category: "Snacks", keywords: ["chip", "cracker", "popcorn", "pretzel", "nut", "trail mix", "granola bar", "candy", "chocolate"] },
  { category: "Beverages", keywords: ["juice", "coffee", "tea", "water", "soda", "cola", "drink", "beer", "wine", "sparkling", "latte"] },
  { category: "Meat & Seafood", keywords: ["chicken", "beef", "pork", "fish", "salmon", "shrimp", "turkey", "bacon", "sausage", "ham", "steak"] },
  { category: "Pantry", keywords: ["rice", "pasta", "flour", "sugar", "oil", "sauce", "spice", "cereal", "oat", "bean", "lentil", "soup", "can"] },
  { category: "Frozen", keywords: ["frozen", "ice cream", "pizza"] },
];

function deriveCategory(title) {
  const lower = (title || "").toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((word) => lower.includes(word))) {
      return rule.category;
    }
  }
  return "Grocery";
}

function collectImageFields(productImage) {
  const fields = {};

  function setField(name, url) {
    if (url && typeof url === "string" && (url.startsWith("http") || url.startsWith("/")) && !fields[name]) {
      fields[name] = url;
    }
  }

  if (!productImage) return fields;

  if (Array.isArray(productImage)) {
    productImage.forEach((entry) => {
      IMAGE_FIELD_PRIORITY.forEach((field) => setField(field, entry?.[field]));
    });
    return fields;
  }

  if (typeof productImage === "object") {
    IMAGE_FIELD_PRIORITY.forEach((field) => setField(field, productImage[field]));
    return fields;
  }

  if (typeof productImage === "string") {
    IMAGE_FIELD_PRIORITY.forEach((field) => {
      const match = productImage.match(new RegExp(`${field}['"]?\\s*:\\s*['"]([^'"]+)['"]`));
      if (match) setField(field, match[1]);
    });

    try {
      const normalized = productImage.replace(/'/g, '"');
      const parsed = JSON.parse(normalized);
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      entries.forEach((entry) => {
        IMAGE_FIELD_PRIORITY.forEach((field) => setField(field, entry?.[field]));
      });
    } catch {
      // ignore malformed image payloads
    }
  }

  return fields;
}

function parseAllProductImageUrls(productImage) {
  const fields = collectImageFields(productImage);
  const urls = [];

  IMAGE_FIELD_PRIORITY.forEach((field) => {
    if (fields[field] && !urls.includes(fields[field])) {
      urls.push(fields[field]);
    }
  });

  return urls;
}

function parseProductImage(productImage) {
  const fields = collectImageFields(productImage);

  for (const field of IMAGE_FIELD_PRIORITY) {
    if (fields[field]) return fields[field];
  }

  return PLACEHOLDER_IMAGE;
}

function getStock(doc) {
  const raw = doc._doc || doc;
  if (typeof raw.quantity === "number" && raw.quantity > 0) return raw.quantity;
  const max = raw.pricingUnits?.maxOrderQuantity;
  if (typeof max === "number" && max > 0) return max;
  return 24;
}

function formatPrice(doc) {
  if (doc.pricing?.displayPrice) return doc.pricing.displayPrice;
  const price = doc.pricing?.price ?? doc.price ?? 0;
  return `$${Number(price).toFixed(2)}`;
}

function normalizeProduct(doc) {
  const plain = typeof doc.toObject === "function" ? doc.toObject({ virtuals: true }) : { ...doc };
  return {
    _id: plain._id,
    name: plain.title || plain.name || "Product",
    title: plain.title || plain.name || "Product",
    category: plain.category || deriveCategory(plain.title || plain.name),
    price: plain.pricing?.price ?? plain.price ?? 0,
    displayPrice: formatPrice(plain),
    quantity: getStock(plain),
    description: plain.description || plain.packageSizing || "Fresh grocery item for your home.",
    imageUrl: parseProductImage(plain.productImage) || plain.imageUrl || PLACEHOLDER_IMAGE,
    packageSizing: plain.packageSizing || "",
  };
}

module.exports = {
  PLACEHOLDER_IMAGE,
  CATEGORY_RULES,
  deriveCategory,
  parseAllProductImageUrls,
  parseProductImage,
  getStock,
  formatPrice,
  normalizeProduct,
};

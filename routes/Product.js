const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/Product");

const upload = require("../middlewares/multer");

const router = express.Router();

router.post("/products", upload, createProduct);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", upload, updateProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;

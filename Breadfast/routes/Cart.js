const express = require("express");
const router = express.Router();

const {
  addToCart,
  updateCart,
} = require("../controllers/Cart");

router.post("/cart/add", addToCart);
router.put("/cart/update", updateCart);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  authorizeAdmin,
  authorizeUser,
} = require("../middlewares/auth");

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { CATEGORY_RULES } = require("../utils/productHelpers");

const PAGE_SIZE = 24;

router.use((req, res, next) => {
  res.locals.buildPageUrl = (baseUrl, overrides = {}) => {
    const page = overrides.page ?? (parseInt(req.query.page, 10) || 1);
    const search = overrides.search ?? (req.query.search || "");
    const category = overrides.category ?? (req.query.category || "");
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };
  next();
});

async function fetchProducts(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const search = (req.query.search || "").trim();
  const category = (req.query.category || "").trim();

  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    const rule = CATEGORY_RULES.find((r) => r.category === category);
    if (rule) {
      filter.title = { $regex: rule.keywords.join("|"), $options: "i" };
    }
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ title: 1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      page,
      limit: PAGE_SIZE,
      total,
      pages: Math.ceil(total / PAGE_SIZE) || 1,
    },
    search,
    category,
    categories: CATEGORY_RULES.map((r) => r.category),
    totalProducts: total,
  };
}

router.get("/", async (req, res) => {
  try {
    const data = await fetchProducts(req);
    res.render("home", { title: "Home", ...data });
  } catch (err) {
    console.error("Failed to load products for home:", err);
    res.render("home", {
      title: "Home",
      products: [],
      pagination: { page: 1, limit: PAGE_SIZE, total: 0, pages: 1 },
      search: "",
      category: "",
      categories: [],
      totalProducts: 0,
    });
  }
});

router.get("/aboutus", (req, res) => {
  res.render("aboutus", { title: "About us" });
});

router.get("/signin", (req, res) => {
  res.render("signin", { title: "Sign in" });
});

router.get("/signup", (req, res) => {
  res.render("signup", { title: "Signup" });
});

router.get("/admin", authenticateToken, authorizeAdmin, (req, res) => {
  res.render("admin/dashboard", { title: "Admin" });
});

router.get(
  "/admin/users",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    res.render("admin/users", {
      title: "Admin",
      users: await User.find(),
    });
  }
);

router.get(
  "/admin/edit-users/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    res.render("admin/editUser", {
      title: "Admin",
      user: await User.findById(req.params.id),
    });
  }
);

router.get(
  "/admin/products",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const docs = await Product.find();
    res.render("admin/products", {
      title: "Admin",
      products: docs.map(p => p.toObject({ virtuals: true })),
    });
  }
);

router.get("/user/:id", authenticateToken, authorizeUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: "cart.items.product",
      select: "name category price quantity imageUrl",
    });

    if (!user) {
      return res.redirect("/");
    }

    const data = await fetchProducts(req);
    res.render("user/home", {
      title: "User",
      user,
      ...data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get(
  "/user/:id/payment",
  authenticateToken,
  authorizeUser,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id).populate({
        path: "cart.items.product",
        select: "name category price quantity imageUrl",
      });

      if (!user) {
        return res.redirect("/");
      }

      // Render the user payment page with user details, products, and cart
      res.render("user/payment", {
        title: "User",
        user,
        products: await Product.find(),
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get(
  "/user/:id/history",
  authenticateToken,
  authorizeUser,
  async (req, res) => {
    const userId = req.params.id;

    const user = await User.findById(req.params.id);

    try {
      // Fetch the orders of the user and populate product details in each item
      const orders = await Order.find({ user: userId })
        .populate({
          path: "items.product", // Populate the product details for each item
          select: "name category price description imageUrl", // Specify the fields you want to include from the Product model
        })
        .sort({ createdAt: -1 }); // Optionally sort by creation date

      if (!orders || orders.length === 0) {
        return res.render("user/history", {
          title: "User",
          user,
          orders,
        });
      }

      res.render("user/history", {
        title: "User",
        user,
        orders,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;

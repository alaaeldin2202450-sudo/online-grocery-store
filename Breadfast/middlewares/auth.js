const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const token = req.cookies.authToken;
  if (!token) return res.redirect("/");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user; // Attach user info to request
    next();
  });
}

// Middleware for admin role
function authorizeAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.redirect("/");
  }
  next();
}

// Middleware for standard users
function authorizeUser(req, res, next) {
  if (req.user.role !== "user") {
    return res.redirect("/");
  }
  next();
}

module.exports = { authenticateToken, authorizeAdmin, authorizeUser };

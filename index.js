const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "breadfast_super_secret_key_2024";
}

const express = require("express");
const app = express();
const connectDB = require("./config/db.js");
const cookieParser = require("cookie-parser");

// Routers
const orderRouter = require("./routes/Order.js");
const productRouter = require("./routes/Product.js");
const userRouter = require("./routes/User.js");
const cartRouter = require("./routes/Cart.js");
const frontendRouter = require("./routes/Frontend.js");

app.use(express.static("public")); // to read static files (css, js, img)
app.use(express.json()); // to read req.body
app.use(cookieParser()); // For parsing cookies
app.use(express.urlencoded({ extended: true })); // to read req.body
app.set("view engine", "ejs"); // to set view engine to ejs

app.use("/", orderRouter);
app.use("/", productRouter);
app.use("/", userRouter);
app.use("/", cartRouter);
app.use("/", frontendRouter);

app.get("/logout", (req, res) => {
  res.cookie("authToken", "", { maxAge: 1 });
  res.redirect("/");
});

app.use((req, res, next) => {
  res.status(404).render("404");
});

// Connect to database for serverless environments
connectDB();

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});

// Export the app for Vercel Serverless Functions
module.exports = app;

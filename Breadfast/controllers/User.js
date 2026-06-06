const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const isDatabaseConnected = () => mongoose.connection.readyState === 1;
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Admin123";

const setAuthCookie = (res, user) => {
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("authToken", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 3600 * 1000,
  });
};

const createUser = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        error:
          "Database connection is unavailable. Check MONGO_URI and Atlas network access.",
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role = "user",
      points = 0,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already taken." });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      points,
    });

    await user.save();
    res.status(201).json({ user, msg: "User Created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const signinUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = {
        id: "admin",
        firstName: "Admin",
        lastName: "User",
        email: ADMIN_EMAIL,
        role: "admin",
      };

      setAuthCookie(res, adminUser);

      return res.status(200).json({
        message: "Login successful",
        user: adminUser,
      });
    }

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        message:
          "Database connection is unavailable. Check MONGO_URI and Atlas network access.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    setAuthCookie(res, {
      id: user._id.toString(),
      role: user.role,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  signinUser,
};

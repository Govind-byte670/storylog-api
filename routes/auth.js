const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authLimiter = require("../middleware/rateLimiter");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required", code: 400 });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        status: false,
        message: "Email already registered",
        code: 400,
      });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ status: true, message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message, code: 500 });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid credentials", code: 400 });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid credentials", code: 400 });
    }
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.json({ status: true, token });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message, code: 500 });
  }
});

module.exports = router;

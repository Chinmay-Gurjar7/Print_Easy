const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Store = require("../models/Store");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      storeName,
      location
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    if (role === "shopkeeper") {
      if (!storeName || !location) {
        await User.findByIdAndDelete(user._id);

        return res.status(400).json({
          message: "Store name and location are required"
        });
      }

      await Store.create({
        name: storeName,
        location,
        owner: user._id
      });
    }

    res.status(201).json({
      message: "Account created successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Signup failed"
    });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      token,
      role: user.role,
      name: user.name
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed"
    });
  }
});


module.exports = router;
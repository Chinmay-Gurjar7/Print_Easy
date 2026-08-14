const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

// ================================
// MIDDLEWARE
// ================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// STATIC FILES
// ================================

app.use(express.static(path.join(__dirname, "../public")));

// ================================
// ROUTES
// ================================

const authRoutes = require("../routes/authRoutes");
const storeRoutes = require("../routes/storeRoutes");
const orderRoutes = require("../routes/orderRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/orders", orderRoutes);

// ================================
// PAGES
// ================================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/signup.html"));
});

app.get("/student", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/student.html"));
});

app.get("/shopkeeper", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/shopkeeper.html"));
});

// ================================
// MONGODB
// ================================

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error);
    });
} else {
  console.warn("MONGO_URI not set. Set it in Vercel environment variables.");
}

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
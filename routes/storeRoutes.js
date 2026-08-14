const express = require("express");

const Store = require("../models/Store");
const Order = require("../models/Order");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();


// GET ALL STORES
router.get("/", protect, async (req, res) => {
  try {
    const stores = await Store.find()
      .populate("owner", "name");

    const result = await Promise.all(
      stores.map(async (store) => {
        const pendingOrders = await Order.countDocuments({
          store: store._id,
          status: { $in: ["pending", "printing"] }
        });

        return {
          _id: store._id,
          name: store.name,
          location: store.location,
          isOpen: store.isOpen,
          pendingOrders,
          estimatedTime: pendingOrders * 5
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load stores"
    });
  }
});


// SHOPKEEPER'S STORE
router.get("/my-store", protect, async (req, res) => {
  try {
    const store = await Store.findOne({
      owner: req.user.id
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found"
      });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load store"
    });
  }
});


module.exports = router;
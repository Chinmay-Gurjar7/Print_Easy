const express = require("express");

const Order = require("../models/Order");
const Store = require("../models/Store");
const protect = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const generateOrderId = require("../utils/generateOrderId");

const router = express.Router();


// ================================
// CREATE ORDER
// ================================

router.post(
  "/",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({
          message: "Only students can place orders"
        });
      }

      const {
        storeId,
        copies,
        printType,
        sides,
        instructions
      } = req.body;

      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a file"
        });
      }

      const store = await Store.findById(storeId);

      if (!store) {
        return res.status(404).json({
          message: "Store not found"
        });
      }

      if (!store.isOpen) {
        return res.status(400).json({
          message: "Store is currently closed"
        });
      }

      const order = await Order.create({
        orderId: generateOrderId(),

        student: req.user.id,

        store: storeId,

        fileName: req.file.originalname,

        fileData: req.file.buffer,

        fileMimeType: req.file.mimetype,

        copies: Number(copies) || 1,

        printType: printType || "black-white",

        sides: sides || "single",

        instructions: instructions || ""
      });

      res.status(201).json({
        message: "Order placed successfully",

        orderId: order.orderId
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to create order"
      });
    }
  }
);


// ================================
// STUDENT ORDERS
// ================================

router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      student: req.user.id
    })
      .select("-fileData")
      .populate("store", "name location")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: "Failed to load orders"
    });
  }
});


// ================================
// SHOPKEEPER QUEUE
// ================================

router.get("/shop-orders", protect, async (req, res) => {
  try {
    if (req.user.role !== "shopkeeper") {
      return res.status(403).json({
        message: "Shopkeeper access required"
      });
    }

    const store = await Store.findOne({
      owner: req.user.id
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found"
      });
    }

    const orders = await Order.find({
      store: store._id,
      status: { $in: ["pending", "printing"] }
    })
      .select("-fileData")
      .populate("student", "name email")
      .sort({ createdAt: 1 });

    res.json(orders);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load queue"
    });
  }
});


// ================================
// DOWNLOAD FILE
// ================================

router.get("/:id/file", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    res.set({
      "Content-Type": order.fileMimeType,
      "Content-Disposition": `inline; filename="${order.fileName}"`
    });

    res.send(order.fileData);

  } catch (error) {
    res.status(500).send("Could not download file");
  }
});


// ================================
// COMPLETE ORDER
// ================================

router.put("/:id/complete", protect, async (req, res) => {
  try {
    if (req.user.role !== "shopkeeper") {
      return res.status(403).json({
        message: "Shopkeeper access required"
      });
    }

    const store = await Store.findOne({
      owner: req.user.id
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found"
      });
    }


    // Find the FIRST pending order in the queue
    const firstOrder = await Order.findOne({
      store: store._id,
      status: "pending"
    }).sort({
      createdAt: 1
    });


    if (!firstOrder) {
      return res.status(400).json({
        message: "No pending orders"
      });
    }


    // IMPORTANT:
    // User can ONLY complete the first order.
    if (firstOrder._id.toString() !== req.params.id) {
      return res.status(400).json({
        message: "Orders must be completed sequentially"
      });
    }


    firstOrder.status = "completed";

    await firstOrder.save();


    res.json({
      message: "Order completed successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to complete order"
    });
  }
});


module.exports = router;
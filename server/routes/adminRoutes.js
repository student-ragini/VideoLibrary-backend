const express = require("express");
const Admin = require("../models/Admin");   // IMPORTANT: Admin model
const router = express.Router();

// optional debug log to confirm file loaded
console.log("adminRoutes loaded. Using model:", Admin.modelName);

router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find().lean();
    res.json(admins);
  } catch (err) {
    console.error("GET /api/admins error:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;

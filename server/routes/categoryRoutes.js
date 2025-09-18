const express = require("express");
const Category = require("../models/Category");
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const categories = await Category.find().lean();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

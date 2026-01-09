const express = require("express");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const router = express.Router();

const SALT_ROUNDS = 10;

console.log("✅ adminRoutes loaded.");

/* =========================
   CREATE ADMIN (ONE TIME)
   POST /api/admin/register
========================= */
router.post("/register", async (req, res) => {
  try {
    const { admin_id, password } = req.body;

    if (!admin_id || !password) {
      return res.json({ success: false, error: "admin_id & password required" });
    }

    const exists = await Admin.findOne({ admin_id });
    if (exists) {
      return res.json({ success: false, error: "Admin already exists" });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const admin = new Admin({
      admin_id,
      password: hashedPassword
    });

    await admin.save();

    res.json({ success: true, message: "Admin created successfully" });
  } catch (err) {
    console.error("Admin register error:", err);
    res.status(500).json({ success: false });
  }
});

/* =========================
   ADMIN LOGIN (NO CHANGE)
========================= */
router.post("/login", async (req, res) => {
  try {
    const { admin_id, password } = req.body;

    if (!admin_id || !password) {
      return res.json({ success: false });
    }

    const admin = await Admin.findOne({ admin_id });
    if (!admin) {
      return res.json({ success: false });
    }

    // 🔐 bcrypt compare
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.json({ success: false });
    }

    return res.json({
      success: true,
      admin_id: admin.admin_id
    });

  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
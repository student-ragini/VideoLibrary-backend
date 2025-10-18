// server/routes/adminRoutes.js
const express = require("express");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const router = express.Router();

console.log("✅ adminRoutes loaded.");

router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find().lean();
    // remove password before sending (dev only)
    const safe = admins.map(a => {
      const { password, ...rest } = a;
      return rest;
    });
    res.json(safe);
  } catch (err) {
    console.error("GET /api/admins error:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

/**
 * POST /api/admin/login
 * Body: { admin_id: "john_admin", password: "..." }
 */
router.post("/login", async (req, res) => {
  try {
    console.log("🔹 Request body:", req.body);
    const { admin_id, password } = req.body;

    if (!admin_id || !password) {
      console.log("❌ Missing admin_id or password");
      return res.json({ success: false, error: "admin_id + password required" });
    }

    const admin = await Admin.findOne({ admin_id });
    if (!admin) {
      console.log("❌ No admin found for:", admin_id);
      return res.json({ success: false });
    }

    const stored = admin.password || "";
    let isMatch = false;

    // If stored password looks like a bcrypt hash — use bcrypt.compare
    // bcrypt hashes typically start with $2, $2a, $2b, $2y
    if (typeof stored === "string" && stored.startsWith("$2")) {
      try {
        isMatch = await bcrypt.compare(password, stored);
        console.log("bcrypt.compare result:", isMatch);
      } catch (err) {
        console.log("bcrypt.compare threw error, fallback to plain compare:", err.message || err);
        isMatch = password === stored;
      }
    } else {
      // stored password is plain text (or not bcrypt) -> simple compare
      isMatch = password === stored;
      console.log("Plain compare result:", isMatch);
      // Also try bcrypt.compare just in case (it returns false for plain, but safe to attempt)
      try {
        const bcryptTry = await bcrypt.compare(password, stored).catch(() => false);
        if (bcryptTry) {
          isMatch = true;
          console.log("bcrypt.compare succeeded unexpectedly for non-$2 value");
        }
      } catch (e) {
        // ignore
      }
    }

    if (!isMatch) {
      console.log("❌ Password mismatch for", admin_id);
      return res.json({ success: false });
    }

    console.log("✅ Admin login success for", admin_id);
    return res.json({ success: true, admin_id: admin.admin_id });
  } catch (err) {
    console.error("POST /api/admin/login error:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

module.exports = router;
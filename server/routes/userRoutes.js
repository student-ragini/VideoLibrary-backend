// server/routes/userRoutes.js
const express = require("express");
const User = require("../models/User");
const router = express.Router();

/* GET /api/users -> list */
router.get("/", async (_req, res) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

/* POST /api/user/register */
router.post("/register", async (req, res) => {
  try {
    const { user_id, user_name, password, email, mobile } = req.body;
    if (!user_id || !user_name || !password || !email) {
      return res.status(400).json({ success: false, error: "user_id, user_name, email, password required" });
    }

    const dupId = await User.findOne({ user_id }).lean();
    if (dupId) return res.json({ success: false, error: "User Id already exists" });

    const dupEmail = await User.findOne({ email }).lean();
    if (dupEmail) return res.json({ success: false, error: "Email already registered" });

    const doc = new User({ user_id, user_name, password, email, mobile: mobile || "" });
    await doc.save();
    return res.json({ success: true, userid: user_id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

/* POST /api/user/login  (by user_id or email + password) */
router.post("/login", async (req, res) => {
  try {
    const body = req.body || {};
    const rawUserId = body.user_id || body.userid || body.user || body.userId || body.username;
    const rawEmail = body.email || body.user_email;
    const rawPassword = body.password || body.pass || body.pwd;

    const user_id = typeof rawUserId === "string" ? rawUserId.trim() : undefined;
    const email = typeof rawEmail === "string" ? rawEmail.trim() : undefined;
    const password = typeof rawPassword === "string" ? rawPassword.trim() : undefined;

    console.log("LOGIN attempt payload:", { user_id, email, hasPassword: !!password });

    if (!password || (!user_id && !email)) {
      return res.json({ success: false });
    }

    let user = null;
    if (user_id) {
      user = await User.findOne({ user_id }).lean();
      console.log("Lookup by user_id result:", !!user);
    }
    if (!user && email) {
      user = await User.findOne({ email }).lean();
      console.log("Lookup by email result:", !!user);
    }

    if (!user) {
      console.log("Login failed: user not found");
      return res.json({ success: false });
    }

    const storedPassword = (user.password !== undefined && user.password !== null) ? String(user.password).trim() : "";

    if (storedPassword !== password) {
      console.log("Login failed: password mismatch");
      return res.json({ success: false });
    }

    console.log("Login success for:", user.user_id || user.email);
    return res.json({ success: true, userid: user.user_id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

module.exports = router;
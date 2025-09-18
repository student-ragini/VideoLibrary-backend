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

/* POST /api/user/register  (manual user_id) */
router.post("/register", async (req, res) => {
  try {
    const { user_id, user_name, password, email, mobile } = req.body;

    if (!user_id || !user_name || !password || !email) {
      return res
        .status(400)
        .json({ success: false, error: "user_id, user_name, email, password required" });
    }

    // duplicate checks
    const dupId = await User.findOne({ user_id }).lean();
    if (dupId) return res.json({ success: false, error: "User Id already exists" });

    const dupEmail = await User.findOne({ email }).lean();
    if (dupEmail) return res.json({ success: false, error: "Email already registered" });

    // create doc in same order
    const doc = new User({
      user_id: user_id,
      user_name: user_name,
      password: password,
      email: email,
      mobile: mobile || ""
    });

    await doc.save();
    return res.json({ success: true, userid: user_id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

/* POST /api/user/login  (by user_id + password; email fallback optional) */
router.post("/login", async (req, res) => {
  try {
    // Accept many possible field names and sanitize
    const body = req.body || {};
    const rawUserId = body.user_id || body.userid || body.user || body.userId || body.username;
    const rawEmail = body.email || body.user_email;
    const rawPassword = body.password || body.pass || body.pwd;

    // Trim strings if present
    const user_id = typeof rawUserId === "string" ? rawUserId.trim() : undefined;
    const email = typeof rawEmail === "string" ? rawEmail.trim() : undefined;
    const password = typeof rawPassword === "string" ? rawPassword.trim() : undefined;

    console.log("LOGIN attempt payload:", { user_id, email, hasPassword: !!password });

    // basic validation
    if (!password || (!user_id && !email)) {
      // respond false (client shows invalid credentials)
      return res.json({ success: false });
    }

    // Try to find user by user_id first, else by email
    let user = null;

    if (user_id) {
      user = await User.findOne({ user_id: user_id }).lean();
      console.log("Lookup by user_id result:", !!user);
    }

    if (!user && email) {
      user = await User.findOne({ email: email }).lean();
      console.log("Lookup by email result:", !!user);
    }

    // If user not found or password mismatch => fail
    if (!user) {
      console.log("Login failed: user not found");
      return res.json({ success: false });
    }

    // Some DBs may store password with extra spaces or different type; normalize
    const storedPassword = (user.password !== undefined && user.password !== null) ? String(user.password).trim() : "";

    if (storedPassword !== password) {
      console.log("Login failed: password mismatch", { storedPassword, provided: password });
      return res.json({ success: false });
    }

    // Success
    console.log("Login success for:", user.user_id || user.email);
    return res.json({ success: true, userid: user.user_id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

module.exports = router;
// server/routes/userRoutes.js
const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = express.Router();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

/* GET /api/users -> list all users (for dev) */
router.get("/", async (_req, res) => {
  try {
    const users = await User.find().lean();
    // NOTE: do NOT return password in production; here for dev only
    const safe = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(safe);
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

    // hash password
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // create doc
    const doc = new User({
      user_id: user_id,
      user_name: user_name,
      password: hashed,
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
    const { user_id, email, password } = req.body;
    if (!password || (!user_id && !email)) return res.json({ success: false });

    const query = user_id ? { user_id } : { email };
    const user = await User.findOne(query);
    if (!user) return res.json({ success: false });

    // compare hashed password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.json({ success: false });

    return res.json({ success: true, userid: user.user_id });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

module.exports = router;

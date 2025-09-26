// server/api.cjs
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// ---------------------
// Middleware
// ---------------------
app.use(
  cors({
    origin: "*", // dev: allow all origins. In production, replace with frontend URL.
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// handle preflight
app.options("*", cors());

// ---------------------
// MongoDB connection
// ---------------------
const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/video-project";

mongoose
  .connect(MONGO)
  .then(() => {
    console.log(
      "✅ MongoDB Connected:",
      MONGO.includes("127.0.0.1") ? "local video-project" : "Atlas Cluster"
    );
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err?.message || err));

// graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.disconnect();
    console.log("🔌 Mongoose disconnected on app termination (SIGINT).");
    process.exit(0);
  } catch (err) {
    console.error("Error during mongoose disconnect:", err);
    process.exit(1);
  }
});

// ---------------------
// Routes import & mount
// ---------------------
const categoryRoutes = require("./routes/categoryRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const videoRoutes = require("./routes/videoRoutes.js");
const savedRoutes = require("./routes/savedRoutes.js");

app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes); // user listing + register/login
app.use("/api/admins", adminRoutes); // admin listing
app.use("/api/videos", videoRoutes);

// saved routes under /api/users (keeps same prefix)
app.use("/api/users", savedRoutes);

// backward-compatible endpoints
app.use("/api/user", userRoutes); // /api/user/register , /api/user/login
app.use("/api/admin", adminRoutes); // /api/admin/login

// default + 404
app.get("/", (req, res) => res.send("API OK"));
app.use((req, res) => res.status(404).send(`Cannot ${req.method} ${req.path}`));

// ---------------------
// Start server
// ---------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT} (PORT ${PORT})`));
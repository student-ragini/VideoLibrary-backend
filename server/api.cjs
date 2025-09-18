
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Mongo connection
mongoose
  .connect("mongodb://127.0.0.1:27017/video-project")
  .then(() => console.log(" MongoDB Connected: video-project"))
  .catch((err) => console.error(" MongoDB Connection Error:", err.message));

// Routes
const categoryRoutes = require("./routes/categoryRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const videoRoutes = require("./routes/videoRoutes.js");
const savedRoutes = require("./routes/savedRoutes.js");

app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);   // user listing + register/login endpoints
app.use("/api/admins", adminRoutes);
app.use("/api/videos", videoRoutes);

// mount saved routes under /api/users (savedRoutes uses /:userId/saved)
app.use("/api/users", savedRoutes);

// backward-compatible singular endpoints
app.use("/api/user", userRoutes);   // /api/user/register , /api/user/login
app.use("/api/admin", adminRoutes); // /api/admin/login

app.get("/", (req, res) => res.send("API OK"));

app.use((req, res) =>
  res.status(404).send(`Cannot ${req.method} ${req.path}`)
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));

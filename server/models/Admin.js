// server/models/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    admin_id: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // plain ya hashed dono chalega
  },
  { collection: "tbladmins", versionKey: false }
);

module.exports = mongoose.model("Admin", adminSchema, "tbladmins");
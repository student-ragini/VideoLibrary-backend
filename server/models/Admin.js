const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    admin_id: { type: String, required: true },
    password: String,
  },
  { collection: "tbladmins", versionKey: false }
);

// third arg forces mongoose to use the exact collection "tbladmins"
module.exports = mongoose.model("Admin", adminSchema, "tbladmins");

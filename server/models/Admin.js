const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    admin_id: { type: String, required: true },
    password: String,
  },
  { collection: "tbladmins", versionKey: false } 
);

module.exports = mongoose.model("Admin", adminSchema);
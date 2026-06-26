const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    admin_id: {
      type: String,
      required: true,
      unique: true,
    },
    admin_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    collection: "tbladmins",
    versionKey: false,
  }
);

module.exports = mongoose.model("Admin", adminSchema);
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    category_id: { type: Number, required: true },
    category_name: { type: String, required: true },
  },
  { collection: "tblcategories", versionKey: false } 
);

module.exports = mongoose.model("Category", categorySchema);
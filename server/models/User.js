const mongoose = require("mongoose");

const SavedItemSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed },
    title: String,
    url: String,
    description: String,
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  { _id: false }
);

// Field order as required (collection name tblusers)
const userSchema = new mongoose.Schema(
  {
    user_id:   { type: String, required: true, unique: true },
    user_name: { type: String, required: true },
    password:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    mobile:    { type: String, default: "" },
    saved:     { type: [SavedItemSchema], default: [] }
  },
  { collection: "tblusers", versionKey: false }
);

module.exports = mongoose.model("User", userSchema);

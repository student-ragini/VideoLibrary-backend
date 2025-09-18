
const mongoose = require("mongoose");

const savedSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true }, 
    video: {
      _id: { type: String, default: null },    
      video_id: { type: Number, default: null },
      title: String,
      description: String,
      url: String,
      likes: Number,
      views: Number,
      category_id: Number,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "tblsaved", versionKey: false }
);

module.exports = mongoose.model("Saved", savedSchema);

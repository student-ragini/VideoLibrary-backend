const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    video_id: { type: Number, required: true },
    title: String,
    description: String,
    url: String,
    likes: Number,
    views: Number,
    category_id: { type: Number, required: true },
  },
  { collection: "tblvideos", versionKey: false } 
);

module.exports = mongoose.model("Video", videoSchema);
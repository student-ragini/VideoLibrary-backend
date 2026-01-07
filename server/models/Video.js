const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    video_id: { type: Number, required: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    comments: { type: String, default: "" }, // <-- added comments field
    url: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    category_id: { type: Number, required: true, default: 1 },
  },
  { collection: "tblvideos", versionKey: false }
);

module.exports = mongoose.model("Video", videoSchema);
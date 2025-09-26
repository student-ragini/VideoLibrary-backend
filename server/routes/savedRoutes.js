// server/routes/savedRoutes.js
const express = require("express");
const Saved = require("../models/Saved");
const Video = require("../models/Video");
const router = express.Router();

/**
 * GET /api/users/:userId/saved
 */
router.get("/:userId/saved", async (req, res) => {
  try {
    const { userId } = req.params;
    const saved = await Saved.find({ user_id: userId }).sort({ createdAt: -1 }).lean();
    res.json(saved);
  } catch (err) {
    console.error("Get saved error:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

/**
 * POST /api/users/:userId/saved
 */
router.post("/:userId/saved", async (req, res) => {
  try {
    const { userId } = req.params;
    let { video } = req.body;
    if (!video) return res.status(400).json({ success: false, error: "video required" });

    if ((video.id !== undefined) && (video.video_id === undefined || video.video_id === null) && (video._id === undefined || video._id === null)) {
      const maybeNum = Number(video.id);
      if (!Number.isNaN(maybeNum)) video.video_id = maybeNum;
      else video._id = String(video.id);
      delete video.id;
    }

    if (video._id !== undefined && video._id !== null) video._id = String(video._id);

    if ((video.video_id !== undefined && video.video_id !== null) && (!video._id || video._id === "null")) {
      try {
        const found = await Video.findOne({ video_id: Number(video.video_id) }).lean();
        if (found && found._id) video._id = String(found._id);
      } catch (lookupErr) {
        console.warn("Video lookup failed for video_id", video.video_id, lookupErr);
      }
    }

    const match = { user_id: userId };
    if (video.video_id !== undefined && video.video_id !== null) match["video.video_id"] = video.video_id;
    else if (video._id) match["video._id"] = String(video._id);
    else if (video.url) match["video.url"] = video.url;

    const exists = await Saved.findOne(match).lean();
    if (exists) return res.json({ success: true, message: "already saved", saved: exists });

    const doc = new Saved({ user_id: userId, video });
    await doc.save();
    res.json({ success: true, saved: doc });
  } catch (err) {
    console.error("Save video error:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

/**
 * DELETE /api/users/:userId/saved/:savedId
 */
router.delete("/:userId/saved/:savedId", async (req, res) => {
  try {
    const { userId, savedId } = req.params;
    const removed = await Saved.findOneAndDelete({ _id: savedId, user_id: userId });
    if (!removed) return res.status(404).json({ success: false, error: "Saved not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete saved error:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

module.exports = router;
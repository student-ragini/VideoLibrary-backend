const express = require("express");
const Video = require("../models/Video");
const router = express.Router();

// GET /api/videos -> list all videos
router.get("/", async (_req, res) => {
  try {
    const videos = await Video.find().lean();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// GET /api/videos/:id -> get single by _id OR by video_id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let video = null;

    // try as ObjectId
    video = await Video.findById(id).lean().catch(() => null);
    if (!video) {
      // fallback: try video_id numeric
      const vidNum = Number(id);
      if (!isNaN(vidNum)) {
        video = await Video.findOne({ video_id: vidNum }).lean();
      }
    }

    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// POST /api/videos -> create new video
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};

    // ensure video_id exists (auto-generate if not)
    if (!payload.video_id) {
      const last = await Video.findOne().sort({ video_id: -1 }).lean();
      payload.video_id = last ? (Number(last.video_id) || 0) + 1 : 1;
    }

    // sanitize numeric fields (in case they came as strings)
    payload.likes = Number(payload.likes) || 0;
    payload.views = Number(payload.views) || 0;
    payload.category_id = Number(payload.category_id) || 1;

    // ensure comments exists (schema has default but set here too)
    if (typeof payload.comments === "undefined") payload.comments = "";

    const doc = new Video(payload);
    await doc.save();
    res.json({ success: true, video: doc });
  } catch (err) {
    console.error("POST /api/videos error:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// PUT /api/videos/:id -> update by _id or video_id
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};

    // sanitize numeric fields if present
    if (body.likes !== undefined) body.likes = Number(body.likes) || 0;
    if (body.views !== undefined) body.views = Number(body.views) || 0;
    if (body.category_id !== undefined) body.category_id = Number(body.category_id) || 1;

    let updated = null;
    // try find by ObjectId first
    updated = await Video.findByIdAndUpdate(id, body, { new: true }).catch(() => null);
    if (!updated) {
      const vidNum = Number(id);
      if (!isNaN(vidNum)) {
        updated = await Video.findOneAndUpdate({ video_id: vidNum }, body, { new: true });
      }
    }

    if (!updated) return res.status(404).json({ error: "Video not found for update" });
    res.json({ success: true, video: updated });
  } catch (err) {
    console.error("PUT /api/videos/:id error:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// DELETE /api/videos/:id -> delete by _id or video_id
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let removed = null;

    removed = await Video.findByIdAndDelete(id).catch(() => null);
    if (!removed) {
      const vidNum = Number(id);
      if (!isNaN(vidNum)) {
        removed = await Video.findOneAndDelete({ video_id: vidNum });
      }
    }

    if (!removed) return res.status(404).json({ error: "Video not found for delete" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/videos/:id error:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

module.exports = router;
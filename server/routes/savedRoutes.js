 const express = require("express");
const Saved = require("../models/Saved");
const Video = require("../models/Video");
const router = express.Router();

/**

GET /api/users/:userId/saved

Return saved items for user
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

POST /api/users/:userId/saved

body: { video: { ... } }

Save a video snapshot for that user (avoid duplicates)

Behavior:

Accepts video.video_id (Number) or video._id (String) or generic video.id (string/number).


If video.video_id present but video._id missing, do a lookup in tblvideos to find the document


and set video._id to the Mongo ObjectId string. This prevents saved.video._id being null.
*/
router.post("/:userId/saved", async (req, res) => {
try {
const { userId } = req.params;
let { video } = req.body;


if (!video) return res.status(400).json({ success: false, error: "video required" });  

// 1) Normalize generic id -> prefer numeric video_id else _id string  
if ((video.id !== undefined) && (video.video_id === undefined || video.video_id === null) && (video._id === undefined || video._id === null)) {  
  const maybeNum = Number(video.id);  
  if (!Number.isNaN(maybeNum)) {  
    video.video_id = maybeNum;  
  } else {  
    video._id = String(video.id);  
  }  
  delete video.id;  
}  

// 2) Ensure string for _id if present  
if (video._id !== undefined && video._id !== null) {  
  video._id = String(video._id);  
}  

// 3) If we have video.video_id but not video._id, try to lookup Video collection  
if ((video.video_id !== undefined && video.video_id !== null) && (!video._id || video._id === "null")) {  
  try {  
    const found = await Video.findOne({ video_id: Number(video.video_id) }).lean();  
    if (found && found._id) {  
      video._id = String(found._id);  
    }  
  } catch (lookupErr) {  
    // ignore lookup error, we still proceed (we only try to fill _id if possible)  
    console.warn("Video lookup failed for video_id", video.video_id, lookupErr);  
  }  
}  

// 4) Build match query to avoid duplicates (prefer video_id, then _id, then url)  
const match = { user_id: userId };  
if (video.video_id !== undefined && video.video_id !== null) match["video.video_id"] = video.video_id;  
else if (video._id) match["video._id"] = String(video._id);  
else if (video.url) match["video.url"] = video.url;  

const exists = await Saved.findOne(match).lean();  
if (exists) return res.json({ success: true, message: "already saved", saved: exists });  

// 5) Save  
const doc = new Saved({ user_id: userId, video });  
await doc.save();  

// Return saved doc (lean copy)  
res.json({ success: true, saved: doc });

} catch (err) {
console.error("Save video error:", err);
res.status(500).json({ success: false, error: err.message || String(err) });
}
});

/**

DELETE /api/users/:userId/saved/:savedId
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
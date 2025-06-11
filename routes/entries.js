const mongoose = require("mongoose");
const express = require("express");
const Entry = require("../models/Entry");
const verifyToken = require("../middleware/auth");
const validateEntry = require("../middleware/validateEntry");
const router = express.Router();

// CREATE entry
router.post("/", verifyToken, validateEntry, async (req, res) => {
  try {
    const { title, body, moodTags, moodScore, date } = req.body;
    const wordCount = body.trim().split(/\s+/).length;
    const entry = new Entry({
      title,
      body,
      moodTags,
      moodScore,
      wordCount,
      date,
      createdBy: req.user.id,
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error("Entry Save Error:", err);
    res.status(400).json({ status: false, message: err.message, code: 400 });
  }
});

// GET all with filters: tag, date range, keyword
router.get("/", verifyToken, async (req, res) => {
  const { tag, start, end, keyword } = req.query;
  const filter = { createdBy: req.user.id };

  if (tag) filter.moodTags = tag;

  if (start || end) {
    filter.date = {};
    if (start) filter.date.$gte = new Date(start);
    if (end) filter.date.$lte = new Date(end);
  }

  if (keyword) {
    const regex = new RegExp(keyword, "i");
    filter.$or = [{ title: regex }, { body: regex }];
  }

  const entries = await Entry.find(filter).sort({ date: -1 });
  res.json(entries);
});

// GET single entry
router.get("/:id", verifyToken, async (req, res) => {
  const entry = await Entry.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
  });
  if (!entry)
    return res
      .status(404)
      .json({ status: false, message: "Entry not found", code: 404 });
  res.json(entry);
});

// UPDATE entry
router.put("/:id", verifyToken, validateEntry, async (req, res) => {
  const { title, body, moodTags, moodScore, date } = req.body;
  const wordCount = body.trim().split(/\s+/).length;
  const updated = await Entry.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.id },
    { title, body, moodTags, moodScore, date, wordCount },
    { new: true }
  );
  if (!updated)
    return res
      .status(404)
      .json({ status: false, message: "Entry not found", code: 404 });
  res.json(updated);
});

// DELETE entry
router.delete("/:id", verifyToken, async (req, res) => {
  const deleted = await Entry.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user.id,
  });
  if (!deleted)
    return res
      .status(404)
      .json({ status: false, message: "Entry not found", code: 404 });
  res.json({ status: true, message: "Entry deleted" });
});

// GET summary stats
router.get("/summary", verifyToken, async (req, res) => {
  const userId = req.user.id;

  const stats = await Entry.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        avgMood: { $avg: "$moodScore" },
        totalWords: { $sum: "$wordCount" },
      },
    },
  ]);

  const tags = await Entry.aggregate([
    { $match: { createdBy: (entry) => entry.createdBy.equals(userId) } },
    { $unwind: "$moodTags" },
    { $group: { _id: "$moodTags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  res.json({
    totalEntries: stats[0]?.totalEntries || 0,
    avgMoodScore: stats[0]?.avgMood || 0,
    totalWordCount: stats[0]?.totalWords || 0,
    mostCommonMoodTag: tags[0]?._id || null,
  });
});

module.exports = router;

const mongoose = require("mongoose");

//Schema
const entrySchema = new mongoose.Schema({
  date: {
    type: Date,
  },
  title: {
    type: String,
  },
  body: {
    type: String,
  },
  moodTags: {
    type: Array,
  },
  moodScore: {
    type: Number,
    min: -5,
    max: 5,
  },
  wordCount: {
    type: Number,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

const Entry = mongoose.model("entry", entrySchema); //model
module.exports = Entry;

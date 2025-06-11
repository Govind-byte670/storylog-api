module.exports = function validateEntry(req, res, next) {
  const { body, moodTags } = req.body;

  let { moodScore } = req.body;
  moodScore = Number(moodScore);

  console.log("Received moodScore:", moodScore, "Type:", typeof moodScore);

  if (!body || body.trim().split(/\s+/).length < 10) {
    return res.status(400).json({
      status: false,
      message: "Entry body must have at least 10 words",
      code: 400,
    });
  }
  if (!Array.isArray(moodTags) || moodTags.length === 0) {
    return res.status(400).json({
      status: false,
      message: "At least one mood tag is required",
      code: 400,
    });
  }
  if (isNaN(moodScore) || moodScore < -5 || moodScore > 5) {
    return res.status(400).json({
      status: false,
      message: "Mood score must be between -5 and 5",
      code: 400,
    });
  }

  next();
};

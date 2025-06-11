const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("./middleware/logger");

const entriesRoutes = require("./routes/entries");
const authRoutes = require("./routes/auth");

dotenv.config();

const connectDB = require("./config/db");
connectDB();

const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.json());
app.use(logger);
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/entries", entriesRoutes);

app.get("/", (req, res) => {
  res.send("🟢 StoryLog API is running");
});

mongoose.connect("mongodb://localhost:27017/management");

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));

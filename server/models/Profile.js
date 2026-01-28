const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  nickname: { type: String },
  picture: { type: String, default: "👩" },
  extraPictures: [{ type: String }], // Array of up to 3 extra pictures
  age: { type: Number },
  location: { type: String },
  tagline: { type: String },
  verified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Profile", profileSchema);

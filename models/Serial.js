const mongoose = require("mongoose");

const SerialSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: String,
  },
  status: {
    type: String,
    enum: ["unclaimed", "claimed", "cleared", "checked"],
    default: "unclaimed"
  },
  winner: {
    type:mongoose.Schema.Types.ObjectId,
    ref: "Winner",
  },
  claimedAt: {
    type: Date
  },
  clearedAt: {
    type: Date
  },
}, { timestamps: true });

module.exports = mongoose.model("Serial", SerialSchema);

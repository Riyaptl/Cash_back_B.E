const mongoose = require("mongoose");

const WinnerSchema = new mongoose.Schema({
  number: {
    type:mongoose.Schema.Types.ObjectId,
        ref: "Serial",
  },
  name: {
    type: String,
  },
  upi: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid"
  }
}, { timestamps: true });

module.exports = mongoose.model("Winner", WinnerSchema);

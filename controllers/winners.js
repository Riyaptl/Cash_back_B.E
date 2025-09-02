const Winner = require("../models/Winner")
const Serial = require("../models/Serial")


// 1. Update status -> claimed
const clearSerial = async (req, res) => {
    try {
         const { number } = req.body;
        if (!number) {
            return res.status(400).json({ message: "Number is required" });
        }

        const serial = await Serial.findOne({ number });
        if (!serial) {
            return res.status(404).json({ message: "Serial not found" });
        }

        if (serial.status !== "claimed") {
            return res.status(400).json({ message: "Serial cannot be cleared." });
        }
        serial.status = "cleared";
        serial.clearedAt = new Date()

        const winner = await Winner.findOne({number: serial._id})
        if (!winner) {
            return res.status(404).json({ message: "Winner not found" });
        }

        winner.status = "paid"
        await winner.save()
        await serial.save();

        return res.status(200).json({
            message: "Serial cleared successfully.",
        });
        
        
    } catch (error) {
        res.status(500).json(error.message)
    }
}

// 2. read winners
const readWinners = async (req, res) => {
    try {
        const { page = 1, limit = 100 } = req.body; 
        let query = {};

        // Convert page/limit to numbers
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const winners = await Winner.find()
            .populate("number", "number status price claimedAt clearedAt")
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Winner.countDocuments(query);

        return res.status(200).json({
            winners,
            total,
            currentPage: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            message: "Winners retrieved"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 2. Export CSV - winner 

module.exports = {clearSerial, readWinners}


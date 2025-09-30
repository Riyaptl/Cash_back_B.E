const Serial = require("../models/Serial")
const Winner = require("../models/Winner")
const fs = require("fs")
const fsPromises = require("fs").promises;
const csv = require("csv-parser");

// 1. Create serial numbers - CSV import
const csvImportSerial = async (req, res) => {
    const filePath = req.file.path;
    const serialsToInsert = [];

    try {

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const number = row.number?.trim();
                const price = row.price?.trim();
                if (number && price) {
                    serialsToInsert.push({
                        number,
                        price,
                    });
                }
            })
            .on('end', async () => {
                if (serialsToInsert.length === 0) {                   
                    await fsPromises.unlink(filePath);
                    return res.status(400).json({ "message": 'No valid rows with "number, price" field found.' });
                }

                await Serial.insertMany(serialsToInsert);

                await fsPromises.unlink(filePath);

                res.status(200).json({ "message": 'CSV imported successfully' });
            });
    } catch (err) {
        if (fs.existsSync(filePath)) await fsPromises.unlink(filePath);
        res.status(500).json(err.message);
    }
}

// 2.  Create serial numbers - single entry
const createSerial = async (req, res) => {
    try {
        const { number, price } = req.body;
        if (!number || !price) {
            return res.status(400).json({ message: "Number and price are required" });
        }

        const newSerial = new Serial({
            number,
            price
        });
        await newSerial.save();
        return res.status(201).json({
            message: "Serial created successfully",
        });
    } catch (error) {
        res.status(500).json(error.message)
    }
}

// 3. Get price from number
const checkSerial = async (req, res) => {
    try {
        const { number } = req.body;

        if (!number) {
            return res.status(400).json({ message: "Serial number is required" });
        }

        const serial = await Serial.findOne({ number });
        if (!serial) {
            return res.status(404).json({ message: "Serial not found" });
        }

        if (serial.status !== "unclaimed" && serial.status !== "checked") {
            return res.status(400).json({ message: "Serial cannot be claimed again." });
        }

        serial.status = "checked"
        serial.checkedAt = new Date()
        await serial.save()

        return res.status(200).json({
            price: serial.price
        });


    } catch (error) {
        res.status(500).json(error.message)
    }
}

// 3. Update status -> pending
const claimSerial = async (req, res) => {
    try {
        const { number, name, upi } = req.body;
        if (!number || !upi) {
            return res.status(400).json({ message: "Serial number and UPI ID are required" });
        }

        const serial = await Serial.findOne({ number });
        if (!serial) {
            return res.status(404).json({ message: "Serial not found" });
        }

        if (serial.status !== "checked") {
            return res.status(400).json({ message: "Serial cannot be claimed again." });
        }
        serial.status = "claimed";
        serial.claimedAt = new Date()

        const winner = new Winner({
            number: serial._id,
            name,
            upi
        });

        serial.winner = winner._id
        await winner.save();
        await serial.save();

        return res.status(200).json({
            message: "Reward claimed successfully. You will receive your reward within 24 to 48 hrs",
        });


    } catch (error) {
        res.status(500).json(error.message)
    }
}
// 4. Show all serials with pagination
const readSerials = async (req, res) => {
    try {
        const { status, price, page = 1, limit = 100 } = req.body; // default page=1, limit=20
        let query = {};

        if (status) query.status = status;
        if (price) query.price = price;

        // Convert page/limit to numbers
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const serials = await Serial.find(query)
            .populate("winner", "name upi")
            .sort({ number: 1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Serial.countDocuments(query);

        return res.status(200).json({
            serials,
            total,
            currentPage: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            message: "Serials retrieved"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = { csvImportSerial, createSerial, checkSerial, claimSerial, readSerials }
const express = require("express");
const router = express.Router();

const authenticateUser = require("../middlewares/JwtAuth");
const { clearSerial, readWinners } = require("../controllers/winners");

router.post("/clear", authenticateUser, clearSerial);
router.post("/read", authenticateUser, readWinners);

module.exports = router;
const express = require("express");
const router = express.Router();

const authenticateUser = require("../middlewares/JwtAuth");
const { readSerials, csvImportSerial, createSerial, claimSerial, checkSerial } = require("../controllers/serials");

router.post("/csv-import", authenticateUser, csvImportSerial);
router.post("/", authenticateUser, createSerial);
router.post("/check", checkSerial);
router.post("/claim", claimSerial);
router.post("/read", authenticateUser, readSerials);

module.exports = router;
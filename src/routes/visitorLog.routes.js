const express = require("express");
const { submitVisitorLog } = require("../controllers/visitorLog.controller");

const router = express.Router();

router.post("/visitor-logs", submitVisitorLog);

module.exports = router;

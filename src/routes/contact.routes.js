const express = require("express");
const { submitContactInquiry } = require("../controllers/contact.controller");
const { validateContactRequest } = require("../middlewares/validate.middleware");

const router = express.Router();

router.post("/contact", validateContactRequest, submitContactInquiry);

module.exports = router;

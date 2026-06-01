const express = require("express");
const upload = require("../middlewares/upload.middleware");
const { uploadImage } = require("../controllers/upload.controller");

const router = express.Router();

router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;

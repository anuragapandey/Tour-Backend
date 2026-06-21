const express = require("express");
const contactRoutes = require("./contact.routes");
const uploadRoutes = require("./upload.routes");
const userRoutes = require("./user.routes");
const visitorLogRoutes = require("./visitorLog.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Tourist API is running.",
  });
});

router.use(uploadRoutes);
router.use(userRoutes);
router.use(contactRoutes);
router.use(visitorLogRoutes);

module.exports = router;

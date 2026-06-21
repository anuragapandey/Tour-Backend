const express = require("express");
const { createOrder, verifyOrderPayment } = require("../controllers/payment.controller");

const router = express.Router();

router.post("/payments/create-order", createOrder);
router.post("/payments/verify", verifyOrderPayment);

module.exports = router;

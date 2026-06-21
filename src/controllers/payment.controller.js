const asyncHandler = require("../utils/asyncHandler");
const { createPaymentOrder, verifyPayment } = require("../services/payment.service");

const createOrder = asyncHandler(async (req, res) => {
  const payment = await createPaymentOrder(req.body);

  res.status(201).json({
    success: true,
    message: "Payment order created.",
    data: payment,
  });
});

const verifyOrderPayment = asyncHandler(async (req, res) => {
  const payment = await verifyPayment(req.body);

  res.status(200).json({
    success: true,
    message: "Payment verified successfully.",
    data: payment,
  });
});

module.exports = {
  createOrder,
  verifyOrderPayment,
};

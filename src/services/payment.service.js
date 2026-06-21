const crypto = require("crypto");
const { pool } = require("../config/db");
const { env } = require("../config/env");
const ApiError = require("../utils/apiError");

const sanitizeText = (value, maxLength = 500) => {
  if (value === undefined || value === null) {
    return null;
  }

  const text = `${value}`.trim();
  return text ? text.slice(0, maxLength) : null;
};

const getRazorpayAuthHeader = () =>
  `Basic ${Buffer.from(`${env.razorpay.keyId}:${env.razorpay.keySecret}`).toString("base64")}`;

const assertRazorpayConfigured = () => {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new ApiError(
      500,
      "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env."
    );
  }
};

const toAmountPaise = (amount) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount < 1) {
    throw new ApiError(400, "Amount must be at least INR 1.");
  }

  return Math.round(numericAmount * 100);
};

const createPaymentOrder = async ({ amount, name, email, phone, description }) => {
  assertRazorpayConfigured();

  const amountPaise = toAmountPaise(amount);
  const receipt = `rcpt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`.slice(0, 40);

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: getRazorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: env.razorpay.currency,
      receipt,
      notes: {
        customer_name: sanitizeText(name, 100) || "",
        customer_phone: sanitizeText(phone, 20) || "",
        customer_email: sanitizeText(email, 100) || "",
      },
    }),
  });

  const order = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      order.error?.description || "Unable to create Razorpay order."
    );
  }

  const insertQuery = `
    INSERT INTO payments (
      receipt, razorpay_order_id, amount, currency,
      customer_name, customer_email, customer_phone, description
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, receipt, razorpay_order_id, amount, currency, status, created_at;
  `;

  const values = [
    receipt,
    order.id,
    amountPaise,
    order.currency || env.razorpay.currency,
    sanitizeText(name, 100),
    sanitizeText(email, 100),
    sanitizeText(phone, 20),
    sanitizeText(description, 1000),
  ];

  const { rows } = await pool.query(insertQuery, values);

  return {
    keyId: env.razorpay.keyId,
    order: rows[0],
  };
};

const verifyPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  assertRazorpayConfigured();

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing Razorpay payment verification fields.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment signature verification failed.");
  }

  const updateQuery = `
    UPDATE payments
    SET
      razorpay_payment_id = $2,
      razorpay_signature = $3,
      status = 'paid',
      paid_at = CURRENT_TIMESTAMP
    WHERE razorpay_order_id = $1
    RETURNING id, receipt, razorpay_order_id, razorpay_payment_id, amount, currency, status, paid_at;
  `;

  const { rows } = await pool.query(updateQuery, [
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  ]);

  if (!rows[0]) {
    throw new ApiError(404, "Payment order not found.");
  }

  return rows[0];
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
};

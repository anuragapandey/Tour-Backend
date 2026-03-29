const asyncHandler = require("../utils/asyncHandler");
const {
  createContactInquiry,
  sendContactInquiryEmails,
} = require("../services/contact.service");

const submitContactInquiry = asyncHandler(async (req, res) => {
  const inquiry = await createContactInquiry(req.body);

  res.status(201).json({
    success: true,
    message: "Successfully connected. Our team will contact you shortly.",
    data: inquiry,
  });

  // Send emails in background so API response is not blocked by SMTP delays.
  sendContactInquiryEmails(req.body).catch((error) => {
    console.error("Contact inquiry saved but email notifications failed:", error.message);
  });
});

module.exports = {
  submitContactInquiry,
};

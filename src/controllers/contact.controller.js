const asyncHandler = require("../utils/asyncHandler");
const {
  createContactInquiry,
  sendContactInquiryEmails,
} = require("../services/contact.service");

const submitContactInquiry = asyncHandler(async (req, res) => {
  const inquiry = await createContactInquiry(req.body);

  try {
    await sendContactInquiryEmails(req.body);
  } catch (error) {
    console.error("Contact inquiry saved but email notifications failed:", error.message);
  }

  res.status(201).json({
    success: true,
    message: "Successfully connected. Our team will contact you shortly.",
    data: inquiry,
  });
});

module.exports = {
  submitContactInquiry,
};

const asyncHandler = require("../utils/asyncHandler");
const {
  createContactInquiry,
  sendContactInquiryEmails,
} = require("../services/contact.service");

const submitContactInquiry = asyncHandler(async (req, res) => {
  const inquiry = await createContactInquiry(req.body);
  const emailStatus = await sendContactInquiryEmails(req.body);
  const responseMessage =
    emailStatus.userEmailSent === false
      ? "Inquiry received successfully. Team has been notified. User confirmation email is disabled in Resend testing mode."
      : "Successfully connected. Our team will contact you shortly.";

  res.status(201).json({
    success: true,
    message: responseMessage,
    data: {
      inquiry,
      email: emailStatus,
    },
  });
});

module.exports = {
  submitContactInquiry,
};

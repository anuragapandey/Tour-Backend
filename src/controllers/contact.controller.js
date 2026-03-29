const asyncHandler = require("../utils/asyncHandler");
const {
  createContactInquiry,
  sendContactInquiryEmails,
} = require("../services/contact.service");

const submitContactInquiry = asyncHandler(async (req, res) => {
  const inquiry = await createContactInquiry(req.body);
  const emailStatus = await sendContactInquiryEmails(req.body);

  res.status(201).json({
    success: true,
    message: "Successfully connected. Our team will contact you shortly.",
    data: {
      inquiry,
      email: emailStatus,
    },
  });
});

module.exports = {
  submitContactInquiry,
};

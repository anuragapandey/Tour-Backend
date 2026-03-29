const { pool } = require("../config/db");
const { env } = require("../config/env");
const { getMissingMailConfig, isMailConfigured, sendMail } = require("../config/mailer");
const ApiError = require("../utils/apiError");

const createContactInquiry = async ({ name, email, phone, description }) => {
  const insertQuery = `
    INSERT INTO contact_inquiries (name, email, phone, description)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, phone, description, created_at;
  `;

  const values = [
    name.trim(),
    email.trim(),
    phone.trim(),
    description ? description.trim() : "",
  ];

  const { rows } = await pool.query(insertQuery, values);
  return rows[0];
};

const sendContactInquiryEmails = async ({ name, email, phone, description }) => {
  if (!isMailConfigured()) {
    const missingKeys = getMissingMailConfig();
    throw new ApiError(
      500,
      `Email service is not configured. Missing: ${missingKeys.join(", ")}.`
    );
  }

  const safeDescription = description?.trim() || "No description provided.";

  const companySubject = `New contact inquiry from ${name}`;
  const companyText = `A new user wants to connect.\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nDescription: ${safeDescription}`;
  const companyHtml = `
    <h2>New Contact Inquiry</h2>
    <p>A user wants to connect with ${env.contact.companyName}.</p>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Phone:</strong> ${phone}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Description:</strong> ${safeDescription}</li>
    </ul>
  `;

  const userSubject = `You are successfully connected with ${env.contact.companyName}`;
  const userText = `Hello ${name},\n\nThank you for contacting ${env.contact.companyName}. We have received your details and will respond shortly.\n\nSupport email: ${env.contact.supportEmail}\nSupport phone: ${env.contact.supportPhone}\n\nRegards,\n${env.contact.companyName}`;
  const userHtml = `
    <p>Hello ${name},</p>
    <p>Thank you for contacting <strong>${env.contact.companyName}</strong>.</p>
    <p>We have received your details and will connect with you shortly.</p>
    <p><strong>Support email:</strong> ${env.contact.supportEmail}<br />
    <strong>Support phone:</strong> ${env.contact.supportPhone}</p>
    <p>Regards,<br />${env.contact.companyName}</p>
  `;

  const notificationRecipients = env.mail.notificationEmails.length
    ? env.mail.notificationEmails
    : [env.contact.supportEmail];

  try {
    await Promise.all([
      ...notificationRecipients.map((recipient) =>
        sendMail({
          to: recipient,
          subject: companySubject,
          text: companyText,
          html: companyHtml,
          replyTo: email,
        })
      ),
      sendMail({
        to: email,
        subject: userSubject,
        text: userText,
        html: userHtml,
        replyTo: env.contact.supportEmail,
      }),
    ]);
  } catch (error) {
    throw new ApiError(502, `Contact inquiry saved, but email delivery failed: ${error.message}`);
  }

  return { sent: true };
};

module.exports = {
  createContactInquiry,
  sendContactInquiryEmails,
};

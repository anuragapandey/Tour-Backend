const nodemailer = require("nodemailer");
const { env } = require("./env");

let cachedTransporter = null;

const isMailConfigured = () =>
  Boolean(env.mail.smtpHost && env.mail.smtpUser && env.mail.smtpPass);

const getTransporter = () => {
  if (!isMailConfigured()) {
    return null;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: env.mail.smtpHost,
    port: env.mail.smtpPort,
    secure: env.mail.smtpSecure,
    connectionTimeout: env.mail.connectionTimeoutMs,
    greetingTimeout: env.mail.greetingTimeoutMs,
    socketTimeout: env.mail.socketTimeoutMs,
    auth: {
      user: env.mail.smtpUser,
      pass: env.mail.smtpPass,
    },
  });

  return cachedTransporter;
};

const sendMail = async ({ to, subject, text, html, replyTo }) => {
  const transporter = getTransporter();

  if (!transporter) {
    throw new Error(
      "Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS."
    );
  }

  await transporter.sendMail({
    from: env.mail.fromEmail,
    to,
    subject,
    text,
    html,
    replyTo,
  });
};

module.exports = {
  isMailConfigured,
  sendMail,
};

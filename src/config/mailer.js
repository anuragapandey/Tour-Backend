const nodemailer = require("nodemailer");
const { env } = require("./env");

let cachedTransporter = null;

const resolveSmtpUser = () => env.mail.smtpUser || env.mail.fromEmail || "";

const getMissingMailConfig = () => {
  const missing = [];

  if (!env.mail.smtpHost) {
    missing.push("SMTP_HOST");
  }

  if (!resolveSmtpUser()) {
    missing.push("SMTP_USER (or SMTP_FROM_EMAIL)");
  }

  if (!env.mail.smtpPass) {
    missing.push("SMTP_PASS");
  }

  return missing;
};

const isMailConfigured = () => getMissingMailConfig().length === 0;

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
    family: env.mail.smtpIpFamily,
    connectionTimeout: env.mail.connectionTimeoutMs,
    greetingTimeout: env.mail.greetingTimeoutMs,
    socketTimeout: env.mail.socketTimeoutMs,
    auth: {
      user: resolveSmtpUser(),
      pass: env.mail.smtpPass,
    },
  });

  return cachedTransporter;
};

const sendMail = async ({ to, subject, text, html, replyTo }) => {
  const transporter = getTransporter();

  if (!transporter) {
    const missingKeys = getMissingMailConfig();
    throw new Error(`Email service is not configured. Missing: ${missingKeys.join(", ")}.`);
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

const verifyMailerConnection = async () => {
  const transporter = getTransporter();

  if (!transporter) {
    return {
      ok: false,
      missingKeys: getMissingMailConfig(),
    };
  }

  await transporter.verify();
  return {
    ok: true,
    missingKeys: [],
  };
};

module.exports = {
  isMailConfigured,
  getMissingMailConfig,
  sendMail,
  verifyMailerConnection,
};

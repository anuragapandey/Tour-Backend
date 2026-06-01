const nodemailer = require("nodemailer");
const { env } = require("./env");

let cachedTransporter = null;

const normalizeProvider = (value) => `${value || ""}`.trim().toLowerCase();

const getMailProvider = () => {
  const configuredProvider = normalizeProvider(env.mail.provider);

  if (configuredProvider === "smtp" || configuredProvider === "resend") {
    return configuredProvider;
  }

  if (env.mail.resendApiKey) {
    return "resend";
  }

  return "smtp";
};

const resolveSmtpUser = () => env.mail.smtpUser || env.mail.fromEmail || "";
const resolveResendFromEmail = () =>
  env.mail.resendFromEmail || env.mail.fromEmail || "onboarding@resend.dev";

const getMissingSmtpConfig = () => {
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

const getMissingResendConfig = () => {
  const missing = [];

  if (!env.mail.resendApiKey) {
    missing.push("RESEND_API_KEY");
  }

  return missing;
};

const getMissingMailConfig = () =>
  getMailProvider() === "resend" ? getMissingResendConfig() : getMissingSmtpConfig();

const isMailConfigured = () => getMissingMailConfig().length === 0;

const getTransporter = () => {
  if (getMailProvider() !== "smtp") {
    return null;
  }

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

const sendMailWithResend = async ({ to, subject, text, html, replyTo }) => {
  if (!globalThis.fetch) {
    throw new Error("Fetch API is not available in this Node runtime.");
  }

  const baseUrl = env.mail.resendApiBaseUrl.replace(/\/$/, "");
  const payload = {
    from: resolveResendFromEmail(),
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html,
  };

  if (replyTo) {
    payload.reply_to = replyTo;
  }

  const response = await fetch(`${baseUrl}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.mail.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await response.text();

  if (!response.ok) {
    let responseMessage = responseBody;

    try {
      const parsed = JSON.parse(responseBody);
      responseMessage = parsed?.message || parsed?.error || responseBody;
    } catch (error) {
      responseMessage = responseBody;
    }

    throw new Error(`Resend API error (${response.status}): ${responseMessage}`);
  }
};

const sendMail = async ({ to, subject, text, html, replyTo }) => {
  if (!isMailConfigured()) {
    const missingKeys = getMissingMailConfig();
    throw new Error(`Email service is not configured. Missing: ${missingKeys.join(", ")}.`);
  }

  if (getMailProvider() === "resend") {
    await sendMailWithResend({ to, subject, text, html, replyTo });
    return;
  }

  const transporter = getTransporter();

  if (!transporter) {
    throw new Error("SMTP transporter is unavailable.");
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
  const provider = getMailProvider();

  if (!isMailConfigured()) {
    return {
      ok: false,
      provider,
      missingKeys: getMissingMailConfig(),
    };
  }

  if (provider === "resend") {
    return {
      ok: true,
      provider,
      missingKeys: [],
    };
  }

  const transporter = getTransporter();

  if (!transporter) {
    return {
      ok: false,
      provider,
      missingKeys: getMissingMailConfig(),
    };
  }

  await transporter.verify();
  return {
    ok: true,
    provider,
    missingKeys: [],
  };
};

module.exports = {
  getMailProvider,
  isMailConfigured,
  getMissingMailConfig,
  sendMail,
  verifyMailerConnection,
};

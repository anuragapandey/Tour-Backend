const path = require("path");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const stripWrappingQuotes = (value) => value.replace(/^['"]+|['"]+$/g, "");
const normalizeOrigin = (origin) => stripWrappingQuotes(origin.trim()).replace(/\/$/, "");
const truthyValues = new Set(["true", "1", "yes", "on"]);

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || `${value}`.trim() === "") {
    return fallback;
  }

  return truthyValues.has(`${value}`.trim().toLowerCase());
};

const parseOrigins = (value, fallback) => {
  const source = value && value.trim() ? value : fallback;

  return source
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);
};

const defaultClientOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const fallbackClientOrigins = [...defaultClientOrigins, "https://*.onrender.com"];
const configuredClientOrigins = parseOrigins(process.env.CLIENT_ORIGIN || "", "");
const clientOrigins =
  configuredClientOrigins.length > 0
    ? Array.from(new Set([...defaultClientOrigins, ...configuredClientOrigins]))
    : fallbackClientOrigins;
const parseEmailList = (value, fallback) => {
  const source = value && value.trim() ? value : fallback;

  return source
    .split(",")
    .map((email) => stripWrappingQuotes(email.trim()))
    .filter(Boolean);
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  serverBaseUrl: process.env.SERVER_BASE_URL || "",
  image: {
    storage:
      (process.env.IMAGE_STORAGE || "database").trim().toLowerCase() === "filesystem"
        ? "filesystem"
        : "database",
  },
  clientOrigins,
  allowAllOrigins: parseBoolean(process.env.ALLOW_ALL_ORIGINS, false),
  db: {
    url:
      process.env.DATABASE_URL ||
      process.env.INTERNAL_DATABASE_URL ||
      process.env.EXTERNAL_DATABASE_URL ||
      "",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tour_db",
    ssl: parseBoolean(process.env.DB_SSL, false),
  },
  contact: {
    companyName: process.env.COMPANY_NAME || "Seven Hills Holidays",
    supportEmail: process.env.SUPPORT_EMAIL || "sevenhillsholiday@gmail.com",
    supportPhone: process.env.SUPPORT_PHONE || "+91 9953166718",
  },
  mail: {
    smtpHost: process.env.SMTP_HOST || "",
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpSecure: parseBoolean(process.env.SMTP_SECURE, false),
    smtpUser: process.env.SMTP_USER || "",
    smtpPass: process.env.SMTP_PASS || "",
    connectionTimeoutMs: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS) || 10000,
    greetingTimeoutMs: Number(process.env.SMTP_GREETING_TIMEOUT_MS) || 10000,
    socketTimeoutMs: Number(process.env.SMTP_SOCKET_TIMEOUT_MS) || 15000,
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.SUPPORT_EMAIL || "sevenhillsholiday@gmail.com",
    notificationEmails: parseEmailList(
      process.env.NOTIFICATION_EMAILS,
      process.env.SUPPORT_EMAIL || "sevenhillsholiday@gmail.com"
    ),
  },
};

module.exports = { env };

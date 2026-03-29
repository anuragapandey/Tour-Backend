const path = require("path");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, "");
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

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  serverBaseUrl: process.env.SERVER_BASE_URL || "",
  clientOrigins: parseOrigins(
    process.env.CLIENT_ORIGIN,
    "http://localhost:5173,http://127.0.0.1:5173,https://*.onrender.com"
  ),
  allowAllOrigins: parseBoolean(process.env.ALLOW_ALL_ORIGINS, true),
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
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SUPPORT_EMAIL || "sevenhillsholiday@gmail.com",
  },
};

module.exports = { env };

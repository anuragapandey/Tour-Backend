const path = require("path");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, "");

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  serverBaseUrl: process.env.SERVER_BASE_URL || "",
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tour_db",
    ssl: process.env.DB_SSL === "true",
  },
  contact: {
    companyName: process.env.COMPANY_NAME || "Seven Hills Holidays",
    supportEmail: process.env.SUPPORT_EMAIL || "sevenhillsholiday@gmail.com",
    supportPhone: process.env.SUPPORT_PHONE || "+91 9953166718",
  },
  mail: {
    smtpHost: process.env.SMTP_HOST || "",
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpSecure: process.env.SMTP_SECURE === "true",
    smtpUser: process.env.SMTP_USER || "",
    smtpPass: process.env.SMTP_PASS || "",
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SUPPORT_EMAIL || "sevenhillsholiday@gmail.com",
  },
};

module.exports = { env };

const app = require("./app");
const dns = require("dns");
const { env } = require("./config/env");
const {
  testDatabaseConnection,
  ensureDatabaseSchema,
  closeDatabaseConnection,
} = require("./config/db");
const { ensureUploadsDirectory } = require("./services/image.service");
const { verifyMailerConnection } = require("./config/mailer");

let server;

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const startServer = async () => {
  try {
    if (env.image.storage === "filesystem") {
      ensureUploadsDirectory();
    }

    await testDatabaseConnection();
    await ensureDatabaseSchema();

    try {
      const mailStatus = await verifyMailerConnection();

      if (mailStatus.ok) {
        console.log("SMTP verified successfully.");
      } else {
        console.warn(
          `SMTP is not configured. Missing: ${mailStatus.missingKeys.join(", ")}.`
        );
      }
    } catch (error) {
      console.warn(`SMTP verification failed: ${error.message}`);
    }

    server = app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing server...`);

  if (server) {
    server.close(async () => {
      await closeDatabaseConnection();
      process.exit(0);
    });
  } else {
    await closeDatabaseConnection();
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();

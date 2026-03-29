const app = require("./app");
const { env } = require("./config/env");
const {
  testDatabaseConnection,
  ensureDatabaseSchema,
  closeDatabaseConnection,
} = require("./config/db");
const { ensureUploadsDirectory } = require("./services/image.service");

let server;

const startServer = async () => {
  try {
    if (env.image.storage === "filesystem") {
      ensureUploadsDirectory();
    }

    await testDatabaseConnection();
    await ensureDatabaseSchema();

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

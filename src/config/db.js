const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { env } = require("./env");

const sslConfig = env.db.ssl ? { rejectUnauthorized: false } : false;

const poolConfig = env.db.url
  ? {
      connectionString: env.db.url,
      ssl: sslConfig,
    }
  : {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      ssl: sslConfig,
    };

const pool = new Pool(poolConfig);

const testDatabaseConnection = async () => {
  await pool.query("SELECT 1;");
};

const ensureDatabaseSchema = async () => {
  const schemaPath = path.resolve(__dirname, "..", "db", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schemaSql);
};

const closeDatabaseConnection = async () => {
  await pool.end();
};

module.exports = {
  pool,
  testDatabaseConnection,
  ensureDatabaseSchema,
  closeDatabaseConnection,
};

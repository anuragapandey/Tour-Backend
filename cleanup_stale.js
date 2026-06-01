const { pool } = require("./src/config/db");

async function cleanup() {
  try {
    const query = "DELETE FROM User_details WHERE name LIKE 'Traveler %' OR image_url LIKE '%seed-%'";
    const result = await pool.query(query);
    console.log(`Deleted ${result.rowCount} stale gallery entries.`);
  } catch (err) {
    console.error("Cleanup failed:", err);
  } finally {
    await pool.end();
  }
}

cleanup();

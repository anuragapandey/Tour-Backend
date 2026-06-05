const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const oldDbUrl = "postgresql://neondb_owner:npg_OgF3YHQjZt2I@ep-spring-field-aqj0drh5.c-8.us-east-1.aws.neon.tech/neondb?sslmode=verify-full";
const newDbUrl = "postgresql://neondb_owner:npg_qRH3Om5QylBL@ep-small-tooth-apx5w6vh.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function migrate() {
  console.log("Starting Migration...");

  // 1. Connect to Old Database and fetch data
  const oldPool = new Pool({
    connectionString: oldDbUrl,
    ssl: { rejectUnauthorized: false }
  });

  let users = [];
  let images = [];
  let inquiries = [];

  try {
    console.log("Fetching data from old database...");

    // Fetch users
    const usersRes = await oldPool.query("SELECT * FROM User_details");
    users = usersRes.rows;
    console.log(`Fetched ${users.length} users.`);

    // Fetch images
    const imagesRes = await oldPool.query("SELECT * FROM uploaded_images");
    images = imagesRes.rows;
    console.log(`Fetched ${images.length} images.`);

    // Fetch contact inquiries
    try {
      const inquiriesRes = await oldPool.query("SELECT * FROM contact_inquiries");
      inquiries = inquiriesRes.rows;
      console.log(`Fetched ${inquiries.length} contact inquiries.`);
    } catch (e) {
      console.log("No contact inquiries found or table doesn't exist:", e.message);
    }

  } catch (err) {
    console.error("Failed to fetch data from old DB:", err);
    await oldPool.end();
    process.exit(1);
  } finally {
    await oldPool.end();
  }

  // 2. Connect to New Database
  const newPool = new Pool({
    connectionString: newDbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Initializing schema in new database...");
    const schemaPath = path.resolve(__dirname, "src", "db", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    await newPool.query(schemaSql);
    console.log("Schema initialized successfully.");

    // Clean up destination tables before migration to avoid conflicts
    console.log("Cleaning destination tables...");
    await newPool.query("TRUNCATE TABLE User_details CASCADE");
    await newPool.query("TRUNCATE TABLE uploaded_images CASCADE");
    await newPool.query("TRUNCATE TABLE contact_inquiries CASCADE");

    // 3. Migrate Images
    console.log("Migrating uploaded images...");
    for (const img of images) {
      const insertQuery = `
        INSERT INTO uploaded_images (id, file_name, mime_type, image_data, size_bytes, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (file_name) DO NOTHING;
      `;
      await newPool.query(insertQuery, [
        img.id,
        img.file_name,
        img.mime_type,
        img.image_data,
        img.size_bytes,
        img.created_at
      ]);
    }
    console.log("Images migrated.");

    // 4. Migrate Users and normalize their image URLs
    console.log("Migrating users...");
    for (const u of users) {
      // Clean URL: if it contains localhost:5000, extract the path `/uploads/...`
      let cleanUrl = u.image_url || "";
      if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
        try {
          const parsedUrl = new URL(cleanUrl);
          if (parsedUrl.pathname.startsWith("/uploads/")) {
            cleanUrl = parsedUrl.pathname;
          }
        } catch (e) {
          // Keep as is if URL parsing fails
        }
      }

      const insertQuery = `
        INSERT INTO User_details (id, name, email, phone, image_url, location, description, travel_date, created_at, deleted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      await newPool.query(insertQuery, [
        u.id,
        u.name,
        u.email,
        u.phone,
        cleanUrl,
        u.location,
        u.description,
        u.travel_date,
        u.created_at,
        u.deleted_at
      ]);
    }
    console.log("Users migrated.");

    // Sync sequence for User_details
    if (users.length > 0) {
      console.log("Syncing sequence for User_details ID...");
      await newPool.query("SELECT setval(pg_get_serial_sequence('User_details', 'id'), coalesce(max(id), 1)) FROM User_details;");
    }

    // 5. Migrate Contact Inquiries
    if (inquiries.length > 0) {
      console.log("Migrating contact inquiries...");
      for (const inq of inquiries) {
        const insertQuery = `
          INSERT INTO contact_inquiries (id, name, email, phone, description, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await newPool.query(insertQuery, [
          inq.id,
          inq.name,
          inq.email,
          inq.phone,
          inq.description,
          inq.created_at
        ]);
      }
      console.log("Contact inquiries migrated.");

      console.log("Syncing sequence for contact_inquiries ID...");
      await newPool.query("SELECT setval(pg_get_serial_sequence('contact_inquiries', 'id'), coalesce(max(id), 1)) FROM contact_inquiries;");
    }

    console.log("=== Database Migration Successful! ===");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await newPool.end();
  }

  // 6. Update .env file with new credentials
  console.log("Updating .env configuration...");
  const envPath = path.resolve(__dirname, ".env");
  let envContent = fs.readFileSync(envPath, "utf8");

  // Replace DATABASE_URL
  envContent = envContent.replace(
    /DATABASE_URL=.*/,
    `DATABASE_URL=${newDbUrl}`
  );

  // Replace DB_HOST
  envContent = envContent.replace(
    /DB_HOST=.*/,
    "DB_HOST=ep-small-tooth-apx5w6vh.c-7.us-east-1.aws.neon.tech"
  );

  // Replace DB_PASSWORD
  envContent = envContent.replace(
    /DB_PASSWORD=.*/,
    "DB_PASSWORD=npg_qRH3Om5QylBL"
  );

  fs.writeFileSync(envPath, envContent, "utf8");
  console.log(".env configuration updated with new Neon database details.");
}

migrate();

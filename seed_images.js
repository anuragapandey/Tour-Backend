const fs = require("fs");
const path = require("path");
const { storeAndNormalizeImage } = require("./src/services/image.service");
const { createUser } = require("./src/services/user.service");
const { pool, ensureDatabaseSchema } = require("./src/config/db");
const { env } = require("./src/config/env");

async function seed() {
  try {
    console.log("Ensuring database schema...");
    await ensureDatabaseSchema();

    const photosDir = path.resolve(__dirname, "../../photes");
    if (!fs.existsSync(photosDir)) {
        console.error(`Photos directory not found at: ${photosDir}`);
        process.exit(1);
    }

    const files = fs.readdirSync(photosDir);
    console.log(`Found ${files.length} files in ${photosDir}`);

    const configuredBaseUrl = env.serverBaseUrl?.trim().replace(/\/$/, "") || "http://localhost:5000";

    for (const file of files) {
      if (!file.match(/\.(jpe?g|png|webp)$/i)) continue;

      const filePath = path.join(photosDir, file);
      const buffer = fs.readFileSync(filePath);

      console.log(`Processing ${file}...`);

      try {
        // Mocking the file object for storeAndNormalizeImage
        const imagePath = await storeAndNormalizeImage({
          buffer,
          originalname: file,
        });

        const fullImageUrl = `${configuredBaseUrl}${imagePath}`;

        const user = await createUser({
          name: "Tourist",
          email: "tourist@example.com",
          phone: "9953166718",
          image_url: fullImageUrl,
          location: "Beautiful Destination",
          description: "A wonderful memory from our tour.",
          travel_date: new Date().toISOString().split('T')[0],
        });

        console.log(`Successfully added ${file} with ID ${user.id}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }

    console.log("Seeding completed.");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await pool.end();
  }
}

seed();

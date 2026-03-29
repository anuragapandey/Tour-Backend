const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");
const { pool } = require("../config/db");
const { env } = require("../config/env");

const uploadsDirectory = path.resolve(process.cwd(), "uploads");
const isDatabaseStorage = () => env.image.storage === "database";

const ensureUploadsDirectory = () => {
  if (isDatabaseStorage()) {
    return;
  }

  if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory, { recursive: true });
  }
};

const upsertStoredImage = async ({ fileName, mimeType, imageBuffer }) => {
  const imageId = `img_${crypto.randomUUID()}`;
  const upsertQuery = `
    INSERT INTO uploaded_images (id, file_name, mime_type, image_data, size_bytes)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (file_name)
    DO UPDATE SET
      mime_type = EXCLUDED.mime_type,
      image_data = EXCLUDED.image_data,
      size_bytes = EXCLUDED.size_bytes;
  `;

  await pool.query(upsertQuery, [imageId, fileName, mimeType, imageBuffer, imageBuffer.length]);
};

const getStoredImageByFileName = async (fileName) => {
  const selectQuery = `
    SELECT file_name, mime_type, image_data, size_bytes, created_at
    FROM uploaded_images
    WHERE file_name = $1
    LIMIT 1;
  `;

  const { rows } = await pool.query(selectQuery, [fileName]);
  return rows[0] || null;
};

const storeAndNormalizeImage = async (file) => {
  const normalizedBuffer = await sharp(file.buffer)
    .rotate()
    .webp({ quality: 88 })
    .toBuffer();

  const fileName = `tour-${Date.now()}-${crypto.randomUUID()}.webp`;

  if (isDatabaseStorage()) {
    await upsertStoredImage({
      fileName,
      mimeType: "image/webp",
      imageBuffer: normalizedBuffer,
    });

    return `/uploads/${fileName}`;
  }

  ensureUploadsDirectory();
  const outputPath = path.join(uploadsDirectory, fileName);
  await fs.promises.writeFile(outputPath, normalizedBuffer);

  return `/uploads/${fileName}`;
};

module.exports = {
  ensureUploadsDirectory,
  storeAndNormalizeImage,
  upsertStoredImage,
  getStoredImageByFileName,
};

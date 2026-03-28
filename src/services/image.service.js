const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const uploadsDirectory = path.resolve(process.cwd(), "uploads");

const ensureUploadsDirectory = () => {
  if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory, { recursive: true });
  }
};

const storeAndNormalizeImage = async (file) => {
  ensureUploadsDirectory();

  const fileName = `tour-${Date.now()}-${crypto.randomUUID()}.webp`;
  const outputPath = path.join(uploadsDirectory, fileName);

  await sharp(file.buffer)
    .rotate()
    .webp({ quality: 88 })
    .toFile(outputPath);

  return `/uploads/${fileName}`;
};

module.exports = {
  ensureUploadsDirectory,
  storeAndNormalizeImage,
};

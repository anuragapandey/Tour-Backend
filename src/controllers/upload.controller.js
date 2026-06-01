const { env } = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { getStoredImageByFileName, storeAndNormalizeImage } = require("../services/image.service");

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required.");
  }

  const imagePath = await storeAndNormalizeImage(req.file);
  const configuredBaseUrl = env.serverBaseUrl?.trim().replace(/\/$/, "");
  const isPlaceholderBaseUrl = /your-render-backend-url\.com/i.test(configuredBaseUrl || "");
  const baseUrl =
    configuredBaseUrl && !isPlaceholderBaseUrl
      ? configuredBaseUrl
      : `${req.protocol}://${req.get("host")}`;

  res.status(201).json({
    success: true,
    message: "Image uploaded successfully.",
    image_url: `${baseUrl}${imagePath}`,
    image_path: imagePath,
  });
});

const serveUploadedImage = asyncHandler(async (req, res, next) => {
  const fileName = req.params.fileName;

  if (!fileName) {
    throw new ApiError(400, "Image file name is required.");
  }

  const image = await getStoredImageByFileName(fileName);

  if (!image) {
    return next();
  }

  res.set("Content-Type", image.mime_type || "application/octet-stream");
  res.set("Content-Length", String(image.size_bytes || image.image_data.length));
  res.set("Cache-Control", "public, max-age=31536000, immutable");

  return res.status(200).send(image.image_data);
});

module.exports = {
  uploadImage,
  serveUploadedImage,
};

const { env } = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { storeAndNormalizeImage } = require("../services/image.service");

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

module.exports = {
  uploadImage,
};

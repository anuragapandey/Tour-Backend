const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const routes = require("./routes");
const { env } = require("./config/env");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

const matchesAllowedOrigin = (requestOrigin, allowedOrigin) => {
  if (allowedOrigin === "*") {
    return true;
  }

  if (!allowedOrigin.includes("*")) {
    return requestOrigin === allowedOrigin;
  }

  const escapedPattern = allowedOrigin
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");

  return new RegExp(`^${escapedPattern}$`).test(requestOrigin);
};

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, "");
    const isAllowedOrigin = env.clientOrigins.some((allowedOrigin) =>
      matchesAllowedOrigin(normalizedOrigin, allowedOrigin)
    );

    if (isAllowedOrigin) {
      return callback(null, true);
    }

    const corsError = new Error(`CORS blocked for origin: ${origin}`);
    corsError.statusCode = 403;
    return callback(corsError);
  },
};

app.use(
  cors(corsOptions)
);
app.options(/.*/, cors(corsOptions));

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Tour_DB API service.",
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

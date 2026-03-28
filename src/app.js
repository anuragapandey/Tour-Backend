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

app.use(
  cors({
    origin: env.clientOrigins,
    credentials: true,
  })
);

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

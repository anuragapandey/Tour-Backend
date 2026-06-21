const asyncHandler = require("../utils/asyncHandler");
const { createVisitorLog } = require("../services/visitorLog.service");

const submitVisitorLog = asyncHandler(async (req, res) => {
  const log = await createVisitorLog(req, req.body);

  res.status(201).json({
    success: true,
    message: "Visitor log saved.",
    data: log,
  });
});

module.exports = {
  submitVisitorLog,
};

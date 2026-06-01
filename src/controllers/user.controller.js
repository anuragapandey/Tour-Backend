const asyncHandler = require("../utils/asyncHandler");
const { createUser, getAllUsers } = require("../services/user.service");

const createUserRecord = asyncHandler(async (req, res) => {
  const savedUser = await createUser(req.body);

  res.status(201).json({
    success: true,
    message: "User details saved successfully.",
    data: savedUser,
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsers();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

module.exports = {
  createUserRecord,
  listUsers,
};

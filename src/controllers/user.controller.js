const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { createUser, getAllUsers, updateUser, deleteUser } = require("../services/user.service");

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

const updateUserRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedUser = await updateUser(id, req.body);

  if (!updatedUser) {
    throw new ApiError(404, "User record not found or already deleted.");
  }

  res.status(200).json({
    success: true,
    message: "User details updated successfully.",
    data: updatedUser,
  });
});

const deleteUserRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedUser = await deleteUser(id);

  if (!deletedUser) {
    throw new ApiError(404, "User record not found or already deleted.");
  }

  res.status(200).json({
    success: true,
    message: "User details soft deleted successfully.",
    data: { id: deletedUser.id },
  });
});

module.exports = {
  createUserRecord,
  listUsers,
  updateUserRecord,
  deleteUserRecord,
};

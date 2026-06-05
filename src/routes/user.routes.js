const express = require("express");
const { createUserRecord, listUsers, updateUserRecord, deleteUserRecord } = require("../controllers/user.controller");
const { validateCreateUserRequest } = require("../middlewares/validate.middleware");

const router = express.Router();

router.post("/user", validateCreateUserRequest, createUserRecord);
router.get("/users", listUsers);
router.put("/user/:id", validateCreateUserRequest, updateUserRecord);
router.delete("/user/:id", deleteUserRecord);

module.exports = router;

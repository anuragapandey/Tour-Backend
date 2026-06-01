const express = require("express");
const { createUserRecord, listUsers } = require("../controllers/user.controller");
const { validateCreateUserRequest } = require("../middlewares/validate.middleware");

const router = express.Router();

router.post("/user", validateCreateUserRequest, createUserRecord);
router.get("/users", listUsers);

module.exports = router;

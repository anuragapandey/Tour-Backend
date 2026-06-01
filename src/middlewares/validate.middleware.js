const { validateContactPayload, validateUserPayload } = require("../utils/validation");
const ApiError = require("../utils/apiError");

const validateCreateUserRequest = (req, res, next) => {
  const errors = validateUserPayload(req.body);

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join(" ")));
  }

  return next();
};

const validateContactRequest = (req, res, next) => {
  const errors = validateContactPayload(req.body);

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join(" ")));
  }

  return next();
};

module.exports = {
  validateCreateUserRequest,
  validateContactRequest,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+()\-\s\d]{7,20}$/;

const validateUserPayload = (payload) => {
  const errors = [];

  const requiredFields = [
    "name",
    "email",
    "phone",
    "image_url",
    "location",
    "description",
    "travel_date",
  ];

  requiredFields.forEach((field) => {
    if (!payload[field] || !String(payload[field]).trim()) {
      errors.push(`${field} is required.`);
    }
  });

  if (payload.email && !EMAIL_REGEX.test(payload.email)) {
    errors.push("Please provide a valid email address.");
  }

  if (payload.phone && !PHONE_REGEX.test(payload.phone)) {
    errors.push("Please provide a valid phone number.");
  }

  if (payload.travel_date) {
    const parsedDate = new Date(payload.travel_date);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.push("travel_date must be a valid date.");
    }
  }

  return errors;
};

const validateContactPayload = (payload) => {
  const errors = [];

  const requiredFields = ["name", "email", "phone"];

  requiredFields.forEach((field) => {
    if (!payload[field] || !String(payload[field]).trim()) {
      errors.push(`${field} is required.`);
    }
  });

  if (payload.email && !EMAIL_REGEX.test(payload.email)) {
    errors.push("Please provide a valid email address.");
  }

  if (payload.phone && !PHONE_REGEX.test(payload.phone)) {
    errors.push("Please provide a valid phone number.");
  }

  if (payload.description && String(payload.description).length > 2000) {
    errors.push("description must be 2000 characters or fewer.");
  }

  return errors;
};

module.exports = {
  validateUserPayload,
  validateContactPayload,
};

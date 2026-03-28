const { pool } = require("../config/db");

const createUser = async ({
  name,
  email,
  phone,
  image_url,
  location,
  description,
  travel_date,
}) => {
  const insertQuery = `
    INSERT INTO User_details (name, email, phone, image_url, location, description, travel_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, name, email, phone, image_url, location, description, travel_date, created_at;
  `;

  const values = [
    name.trim(),
    email.trim(),
    phone.trim(),
    image_url.trim(),
    location.trim(),
    description.trim(),
    travel_date,
  ];

  const { rows } = await pool.query(insertQuery, values);
  return rows[0];
};

const getAllUsers = async () => {
  const selectQuery = `
    SELECT id, name, email, phone, image_url, location, description, travel_date, created_at
    FROM User_details
    ORDER BY created_at DESC;
  `;

  const { rows } = await pool.query(selectQuery);
  return rows;
};

module.exports = {
  createUser,
  getAllUsers,
};

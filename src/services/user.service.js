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
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC;
  `;

  const { rows } = await pool.query(selectQuery);
  return rows;
};

const updateUser = async (id, {
  name,
  email,
  phone,
  image_url,
  location,
  description,
  travel_date,
}) => {
  const updateQuery = `
    UPDATE User_details
    SET name = $1, email = $2, phone = $3, image_url = $4, location = $5, description = $6, travel_date = $7
    WHERE id = $8 AND deleted_at IS NULL
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
    id,
  ];

  const { rows } = await pool.query(updateQuery, values);
  return rows[0];
};

const deleteUser = async (id) => {
  const deleteQuery = `
    UPDATE User_details
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id;
  `;

  const { rows } = await pool.query(deleteQuery, [id]);
  return rows[0];
};

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
};

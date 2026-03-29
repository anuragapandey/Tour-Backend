CREATE TABLE IF NOT EXISTS User_details (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    image_url TEXT,
    location VARCHAR(255),
    description TEXT,
    travel_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_details_created_at
ON User_details (created_at DESC);

CREATE TABLE IF NOT EXISTS contact_inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at
ON contact_inquiries (created_at DESC);

CREATE TABLE IF NOT EXISTS uploaded_images (
    id VARCHAR(64) PRIMARY KEY,
    file_name TEXT NOT NULL UNIQUE,
    mime_type VARCHAR(100) NOT NULL,
    image_data BYTEA NOT NULL,
    size_bytes INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uploaded_images_created_at
ON uploaded_images (created_at DESC);

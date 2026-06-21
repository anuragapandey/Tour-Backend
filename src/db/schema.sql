CREATE TABLE IF NOT EXISTS User_details (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    image_url TEXT,
    location VARCHAR(255),
    description TEXT,
    travel_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
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

CREATE TABLE IF NOT EXISTS visitor_logs (
    id SERIAL PRIMARY KEY,
    visitor_id VARCHAR(100),
    session_id VARCHAR(100),
    ip_address VARCHAR(100),
    forwarded_for TEXT,
    user_agent TEXT,
    accept_language TEXT,
    referrer TEXT,
    page_url TEXT,
    page_path TEXT,
    page_title TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    viewport_width INTEGER,
    viewport_height INTEGER,
    timezone VARCHAR(100),
    language VARCHAR(50),
    platform VARCHAR(100),
    device_memory NUMERIC,
    hardware_concurrency INTEGER,
    connection_type VARCHAR(50),
    effective_connection_type VARCHAR(50),
    do_not_track VARCHAR(20),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    country VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude NUMERIC,
    longitude NUMERIC,
    consent_source VARCHAR(50) DEFAULT 'site_notice',
    visit_count INTEGER DEFAULT 1,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visitor_logs_created_at
ON visitor_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_visitor_logs_visitor_id
ON visitor_logs (visitor_id);

ALTER TABLE visitor_logs ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1;
ALTER TABLE visitor_logs ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

DELETE FROM visitor_logs newer
USING visitor_logs older
WHERE newer.visitor_id IS NOT NULL
  AND newer.visitor_id = older.visitor_id
  AND newer.id > older.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_visitor_logs_unique_visitor_id
ON visitor_logs (visitor_id)
WHERE visitor_id IS NOT NULL;

-- Migration to support soft delete
ALTER TABLE User_details ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

const { pool } = require("../config/db");

const sanitizeText = (value, maxLength = 1000) => {
  if (value === undefined || value === null) {
    return null;
  }

  const text = `${value}`.trim();
  return text ? text.slice(0, maxLength) : null;
};

const toInteger = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : null;
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const firstForwardedIp =
    typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() : "";

  return (
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    firstForwardedIp ||
    req.ip ||
    req.socket?.remoteAddress ||
    ""
  );
};

const createVisitorLog = async (req, payload = {}) => {
  const values = [
    sanitizeText(payload.visitorId, 100),
    sanitizeText(payload.sessionId, 100),
    sanitizeText(getClientIp(req), 100),
    sanitizeText(req.headers["x-forwarded-for"], 1000),
    sanitizeText(req.headers["user-agent"], 1000),
    sanitizeText(req.headers["accept-language"], 500),
    sanitizeText(payload.referrer || req.headers.referer, 1000),
    sanitizeText(payload.pageUrl, 1000),
    sanitizeText(payload.pagePath, 500),
    sanitizeText(payload.pageTitle, 500),
    toInteger(payload.screenWidth),
    toInteger(payload.screenHeight),
    toInteger(payload.viewportWidth),
    toInteger(payload.viewportHeight),
    sanitizeText(payload.timezone, 100),
    sanitizeText(payload.language, 50),
    sanitizeText(payload.platform, 100),
    toNumber(payload.deviceMemory),
    toInteger(payload.hardwareConcurrency),
    sanitizeText(payload.connectionType, 50),
    sanitizeText(payload.effectiveConnectionType, 50),
    sanitizeText(payload.doNotTrack, 20),
    sanitizeText(payload.utmSource, 255),
    sanitizeText(payload.utmMedium, 255),
    sanitizeText(payload.utmCampaign, 255),
    sanitizeText(payload.utmTerm, 255),
    sanitizeText(payload.utmContent, 255),
    sanitizeText(payload.country, 100),
    sanitizeText(payload.region, 100),
    sanitizeText(payload.city, 100),
    toNumber(payload.latitude),
    toNumber(payload.longitude),
    sanitizeText(payload.consentSource || "site_notice", 50),
  ];

  if (values[0]) {
    const updateQuery = `
      UPDATE visitor_logs
      SET
        session_id = $2,
        ip_address = $3,
        forwarded_for = $4,
        user_agent = $5,
        accept_language = $6,
        referrer = $7,
        page_url = $8,
        page_path = $9,
        page_title = $10,
        screen_width = $11,
        screen_height = $12,
        viewport_width = $13,
        viewport_height = $14,
        timezone = $15,
        language = $16,
        platform = $17,
        device_memory = $18,
        hardware_concurrency = $19,
        connection_type = $20,
        effective_connection_type = $21,
        do_not_track = $22,
        utm_source = COALESCE($23, utm_source),
        utm_medium = COALESCE($24, utm_medium),
        utm_campaign = COALESCE($25, utm_campaign),
        utm_term = COALESCE($26, utm_term),
        utm_content = COALESCE($27, utm_content),
        country = COALESCE($28, country),
        region = COALESCE($29, region),
        city = COALESCE($30, city),
        latitude = COALESCE($31, latitude),
        longitude = COALESCE($32, longitude),
        consent_source = $33,
        visit_count = COALESCE(visit_count, 1) + 1,
        last_seen_at = CURRENT_TIMESTAMP
      WHERE id = (
        SELECT id
        FROM visitor_logs
        WHERE visitor_id = $1
        ORDER BY created_at ASC
        LIMIT 1
      )
      RETURNING id, visitor_id, session_id, page_path, visit_count, last_seen_at, created_at;
    `;

    const { rows } = await pool.query(updateQuery, values);

    if (rows[0]) {
      return rows[0];
    }
  }

  const insertQuery = `
    INSERT INTO visitor_logs (
      visitor_id, session_id, ip_address, forwarded_for, user_agent,
      accept_language, referrer, page_url, page_path, page_title,
      screen_width, screen_height, viewport_width, viewport_height,
      timezone, language, platform, device_memory, hardware_concurrency,
      connection_type, effective_connection_type, do_not_track,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      country, region, city, latitude, longitude, consent_source
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
      $31, $32, $33
    )
    RETURNING id, visitor_id, session_id, page_path, created_at;
  `;

  const { rows } = await pool.query(insertQuery, values);
  return rows[0];
};

module.exports = {
  createVisitorLog,
};

# Backend Deployment on Render

## 1) Render Web Service Setup
- Root directory: `Backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

## 2) Required Environment Variables
Set these in Render dashboard (`Environment` tab):

```env
NODE_ENV=production
CLIENT_ORIGIN=https://<your-frontend>.onrender.com,http://localhost:5173,http://127.0.0.1:5173
ALLOW_ALL_ORIGINS=false

DATABASE_URL=<use Render Postgres Internal Database URL>
DB_SSL=false

COMPANY_NAME=Seven Hills Holidays
SUPPORT_EMAIL=sevenhillsholiday@gmail.com
SUPPORT_PHONE=+91 9953166718

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<required-for-email>
SMTP_PASS=<required-app-password>
SMTP_FROM_EMAIL=<usually same as SMTP_USER>
NOTIFICATION_EMAILS=sevenhillsholiday@gmail.com
SMTP_CONNECTION_TIMEOUT_MS=10000
SMTP_GREETING_TIMEOUT_MS=10000
SMTP_SOCKET_TIMEOUT_MS=15000
```

Notes:
- If you use `External Database URL`, set `DB_SSL=true`.
- Keep `SERVER_BASE_URL` empty unless you want a fixed API domain.
- Do not wrap `CLIENT_ORIGIN` in quotes. Use `a,b,c`, not `"a,b,c"`.
- For Gmail SMTP, use `SMTP_USER` and a Gmail App Password in `SMTP_PASS` (normal account password usually fails).
- `NOTIFICATION_EMAILS` supports comma-separated recipients.

## 3) Frontend API URL
In frontend deployment env, set:

```env
VITE_API_BASE_URL=https://<your-backend-service>.onrender.com
```

Without this, frontend can call wrong base URL.

## 4) If You See 403 from Frontend
- Confirm frontend domain is included in `CLIENT_ORIGIN`.
- No trailing spaces in origin list.
- Redeploy backend after changing env vars.

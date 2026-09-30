# NetAudit AI — Multi-Vendor Network Security Compliance Auditor

Hackathon prototype: AI-driven compliance auditing for **Cisco / Fortinet / Juniper** devices.
Dark, neon-cyan cybersecurity UI · FastAPI + SQLite backend · React (Vite) + Tailwind CSS v4.

## Quick Start

Double-click **`start.bat`** (opens backend, frontend, and the app in your browser).

Or manually:

```bash
# Backend  → http://127.0.0.1:8001  (Swagger docs at /docs)
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload

# Frontend → http://localhost:5173   (new terminal)
cd frontend
npm install
npm run dev
```

> Port **8001** is used because 8000 was occupied. The Vite proxy (`vite.config.js`) already targets 8001.
> Login screen accepts **any email + password** (demo auth).

## Directory Structure

```
netaudit-ai/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app + all REST endpoints
│   │   ├── models.py      # SQLAlchemy: Devices, Vulnerabilities
│   │   ├── schemas.py     # Pydantic response models
│   │   ├── database.py    # SQLite engine/session
│   │   └── seed.py        # Mock devices + vulnerability catalog
│   ├── requirements.txt
│   └── netaudit.db        # Created & auto-seeded on first run
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Auth gate + layout + routing
│   │   ├── api.js             # Fetch client (proxied to backend)
│   │   ├── theme.js           # Severity/vendor badge styles
│   │   ├── components/        # Login, Sidebar, Header, KpiCards,
│   │   │                      # UploadZone, VulnTable, PatchModal, Toast
│   │   └── pages/             # Dashboard, ScanConfig, Reports
│   ├── vite.config.js         # React + Tailwind + /api proxy
│   └── package.json
└── start.bat                  # One-click full-stack launch
```

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload a `.cfg/.conf/.txt` file → mock-parses it, detects vendor/hostname, generates 2–3 vulnerabilities |
| `GET` | `/api/devices` | All scanned devices (+ vuln/critical/fixed counts) |
| `GET` | `/api/vulnerabilities/{device_id}` | Compliance report for one device |
| `GET` | `/api/vulnerabilities` | All findings (joined with device vendor/hostname) |
| `POST` | `/api/remediate/{vuln_id}` | Marks a finding fixed, returns success message |
| `GET` | `/api/stats` | KPIs: total devices, critical risks, compliance score |

## UI Features

- **Login** — glassmorphism card, shield logo, neon-cyan accents (any credentials work)
- **Dashboard** — KPI cards (Total Devices / Critical Risks / Compliance Score), drag-&-drop config upload, scanned-device list, filterable vulnerability table
- **Generate Patch** — modal showing the exact vendor CLI command (copy button + "Apply & Mark Fixed")
- **Scan Config** — scan depth, rule-module toggles, schedule
- **Reports** — compliance-by-vendor bars, report history, export actions
- Strict dark theme: slate-950/900 background, cyan/emerald neon accents, `System Status: Secure` header

## Reset Demo Data

Delete `backend/netaudit.db` and restart the backend — it re-seeds automatically.

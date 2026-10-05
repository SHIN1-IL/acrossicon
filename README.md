# AcrossIcon AI

Chrome Extension (Manifest V3) Side Panel — AI logos, product banners, and hero images.

## Stack

- Chrome Extension Manifest V3 + Side Panel API
- Vite + React + TypeScript + Tailwind CSS
- FastAPI backend: license quota + ops console (`backend/ops`)

## Plans

| Plan | Daily | Monthly | Price (KRW) |
|------|-------|---------|-------------|
| Standard | 10 | 60 | 14,900 |
| Premium | 20 | 120 | 29,900 |

See `docs/OPERATIONS.md` for admin console and Render deploy.

## Setup

```bash
npm install
npm run build
```

## Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist` folder

Settings: API Key + **License key** (+ optional license server URL).

## Dev

```bash
npm run dev
```

Backend (local):

```bash
cd backend && pip install -r requirements.txt
ADMIN_TOKEN=dev uvicorn main:app --reload --port 8000
# Ops: http://127.0.0.1:8000/ops/
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (UI preview) |
| `npm run build` | Typecheck + production build to `dist/` |

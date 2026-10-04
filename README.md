# AcrossMark AI

Chrome Extension (Manifest V3) Side Panel app that generates professional logo candidates from a brand name, style keywords, and color theme.

## Stack

- Chrome Extension Manifest V3 + Side Panel API
- Vite + React + TypeScript + Tailwind CSS
- Lucide React
- `chrome.storage.local` for API keys & history

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

Click the extension icon to open the Side Panel. Open **Settings** (gear) and paste your OpenAI or Google API key.

## Dev

```bash
npm run dev
```

Note: Side Panel / `chrome.*` APIs require loading the built extension. Use `npm run build` for full extension testing.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (UI preview) |
| `npm run build` | Typecheck + production build to `dist/` |

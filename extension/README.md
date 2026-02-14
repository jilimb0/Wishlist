# WishTracker Browser Extension

Chrome extension for quickly adding items to WishTracker.

**Stack**: Vite + React + TypeScript + Tailwind CSS (Manifest V3).

## Installation

### 1. Build

```bash
cd extension
pnpm install
npm run build
```

The build output will be in the `dist` folder.

### 2. Load in Chrome/Edge/Brave

1. Open `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder inside `extension/`

## Features

- **Context Menu**: Right-click on any page -> "Add to WishTracker" (opens popup window)
- **Toolbar Popup**: Click extension icon to open the main UI
- **Auto-scrape**: Automatically extracts OG tags, JSON-LD price, and title
- **Auth**: Configure token/login directly in the extension

## Development

```bash
# Watch mode
npm run dev
```

Note: In dev mode Vite serves files from memory, but Chrome extensions need physical files. Use `npm run build` to generate the `dist` folder for loading.

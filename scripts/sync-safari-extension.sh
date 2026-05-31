#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/extension/dist"
DEST="$ROOT/Wishlist/Shared (Extension)/Resources"

if [ ! -d "$SRC" ]; then
  echo "Build the extension first: pnpm --filter wishtracker-extension run build"
  exit 1
fi

mkdir -p "$DEST"
cp -f "$SRC"/*.js "$DEST/" 2>/dev/null || true
cp -f "$SRC"/*.css "$DEST/" 2>/dev/null || true
cp -f "$SRC"/popup.html "$DEST/" 2>/dev/null || true

echo "Synced extension dist → Safari Resources"

#!/usr/bin/env bash
# Downloads the curated originals (plan §5) from Google Drive into media-src/ (gitignored).
set -euo pipefail
cd "$(dirname "$0")/.."
for group in logos images videos; do
  mkdir -p "media-src/$group"
  node -e "const m=require('./scripts/media-manifest.json');for(const [f,id] of Object.entries(m['$group']))console.log(f+' '+id)" |
  while read -r file id; do
    out="media-src/$group/$file"
    [ -s "$out" ] && continue
    curl -sSL --retry 3 -o "$out" "https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t"
    echo "✓ $out ($(du -h "$out" | cut -f1))"
  done
done

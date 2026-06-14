#!/usr/bin/env bash
# prebuild-sync.sh
# ------------------------------------------------------------------------------
# Mirror `assets/images/**` -> `public/assets/images/**` so Vite's `publicDir`
# (which is the ONLY directory whose contents are copied verbatim into dist/)
# always has every scenario/outcome PNG that the gen_*.py scripts write.
#
# Without this, `npm run build` ships a stale subset of images and gh-pages
# deploys silently regress (see commit c1e43ee).
#
# Usage:
#   ./prebuild-sync.sh              # sync + print summary
#   npm run build                   # auto-runs this via "prebuild" hook
#
# Idempotent: rsync -a --update only copies files that are newer in source.
# Exits non-zero on hard failure (missing source dir, rsync unavailable).
# ------------------------------------------------------------------------------
set -euo pipefail

# Resolve project root from this script's location (works whether invoked from
# repo root, npm, or CI). Falls back to $PWD if BASH_SOURCE is unset.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

SRC="$PROJECT_ROOT/assets/images"
DST="$PROJECT_ROOT/public/assets/images"

# Sanity: source must exist; this is the only hard failure.
if [[ ! -d "$SRC" ]]; then
  echo "[prebuild-sync] ERROR: source dir not found: $SRC" >&2
  exit 1
fi

# Prefer rsync (preserves mtimes, --update avoids touching unchanged files).
# Fall back to cp -ru if rsync is missing (rare on macOS/Linux dev boxes).
if command -v rsync >/dev/null 2>&1; then
  # -a archive (recursive + perms), --update skip newer-in-dst, --delete
  #   remove files in DST that no longer exist in SRC (handles renames cleanly),
  # -m prune empty dirs, --stats brief summary (compatible with macOS rsync 2.x
  #   which lacks GNU's --info=stats2).
  # --exclude skips non-PNG artifacts (markdown design docs, prompts) so we
  # don't ship them to gh-pages — only the actual image assets.
  rsync -a --update --delete -m --stats \
    --exclude='*.md' --exclude='*.txt' --exclude='*.json' --exclude='*.log' \
    "$SRC/" "$DST/" 2>&1 | tail -10
else
  echo "[prebuild-sync] rsync not found, falling back to cp -ru"
  mkdir -p "$DST"
  # cp -ru doesn't support --delete, so do a manual prune of stale files.
  # Only delete regular files (skip subdirs themselves) to be safe.
  if [[ -d "$DST" ]]; then
    (cd "$SRC" && find . -type f) | while read -r rel; do
      src_file="$SRC/$rel"
      dst_file="$DST/$rel"
      mkdir -p "$(dirname "$dst_file")"
      cp -u "$src_file" "$dst_file"
    done
    # Prune files in DST absent from SRC (best-effort, single level).
    (cd "$DST" && find . -type f) | while read -r rel; do
      if [[ ! -e "$SRC/$rel" ]]; then
        echo "[prebuild-sync] prune stale: $rel"
        rm -f "$DST/$rel"
      fi
    done
  fi
fi

# Summary so the build log makes the sync visible.
scenarios_src=$(find "$SRC/scenarios" -maxdepth 1 -type f -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
outcomes_src=$(find "$SRC/outcomes" -maxdepth 1 -type f -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
scenarios_dst=$(find "$DST/scenarios" -maxdepth 1 -type f -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
outcomes_dst=$(find "$DST/outcomes" -maxdepth 1 -type f -name '*.png' 2>/dev/null | wc -l | tr -d ' ')

echo "[prebuild-sync] src: scenarios=$scenarios_src outcomes=$outcomes_src"
echo "[prebuild-sync] dst: scenarios=$scenarios_dst outcomes=$outcomes_dst"

# Mismatch is a soft warning, not failure — gen scripts may be mid-run or
# some categories intentionally have no outcomes yet.
if [[ "$scenarios_src" != "$scenarios_dst" ]] || [[ "$outcomes_src" != "$outcomes_dst" ]]; then
  echo "[prebuild-sync] WARN: src/dst counts differ; check for interrupted gen_*.py run" >&2
fi

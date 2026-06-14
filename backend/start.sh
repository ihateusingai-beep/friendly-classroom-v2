#!/bin/sh
# 友愛教室 V2 — Render startup script
set -e

# Bind to Render's assigned port (default 10000)
PORT=${PORT:-8000}

# DATA_DIR: use Render Persistent Disk mount, fallback to /data subdir
DATA_DIR="${DATA_DIR:-/data}"

echo "[start.sh] PORT=$PORT DATA_DIR=$DATA_DIR"

# Ensure data directory exists
mkdir -p "$DATA_DIR"

# Run uvicorn
exec uvicorn main:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    --workers 1
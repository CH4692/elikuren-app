#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

echo "Starting database..."
docker compose -f docker-compose.db.yml up -d

echo "Waiting for database..."
until docker exec elikuren-db-local pg_isready -U elikuren -d elikuren >/dev/null 2>&1; do
  sleep 1
done

echo "Starting FastAPI..."
cd "../app-elikuren-api"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
API_PID=$!

echo "Starting Next.js..."
cd "../app-elikuren-web"
npm run dev &
WEB_PID=$!

echo ""
echo "DB:      localhost:5432"
echo "API:     http://localhost:8000"
echo "Frontend:http://localhost:3000"
echo ""

trap 'kill $API_PID $WEB_PID' EXIT
wait
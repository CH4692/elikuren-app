#!/usr/bin/env bash
set -euo pipefail

STACK="${1:-}"

if [ "$STACK" != "dev" ] && [ "$STACK" != "prod" ]; then
  echo "Usage: $0 <dev|prod>"
  exit 1
fi

REPO_DIR="/opt/elikuren-app"
DEPLOY_DIR="$REPO_DIR/deploy"
TRAEFIK_DIR="$DEPLOY_DIR/traefik"

cd "$REPO_DIR"

git fetch origin
git reset --hard "origin/$STACK"

cd "$TRAEFIK_DIR"
docker compose --env-file ".env.$STACK" pull
docker compose --env-file ".env.$STACK" up -d

cd "$DEPLOY_DIR"
docker compose -f "docker-compose.$STACK.yml" --env-file ".env.$STACK" pull
docker compose -f "docker-compose.$STACK.yml" --env-file ".env.$STACK" up -d
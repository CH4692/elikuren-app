#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <dev|prod> <web_image> <api_image>"
  exit 1
fi

ENVIRONMENT="$1"
WEB_IMAGE_VALUE="$2"
API_IMAGE_VALUE="$3"

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo "Environment must be 'dev' or 'prod'"
  exit 1
fi

ENV_FILE="deploy/.env.${ENVIRONMENT}"
COMPOSE_FILE="deploy/docker-compose.${ENVIRONMENT}.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE"
  exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Missing compose file: $COMPOSE_FILE"
  exit 1
fi

get_env_var() {
  local key="$1"
  local file="$2"
  grep -E "^${key}=" "$file" | head -n1 | cut -d'=' -f2-
}

update_env_var() {
  local key="$1"
  local value="$2"
  local file="$3"

  if grep -q "^${key}=" "$file"; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

rollback() {
  echo "Healthcheck failed. Rolling back..."
  update_env_var "WEB_IMAGE" "$PREVIOUS_WEB_IMAGE" "$ENV_FILE"
  update_env_var "API_IMAGE" "$PREVIOUS_API_IMAGE" "$ENV_FILE"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
  rm -f "${ENV_FILE}.bak"
  echo "Rollback finished"
  exit 1
}

wait_for_healthchecks() {
  local web_host="$1"
  local api_host="$2"
  local attempts=18
  local sleep_seconds=5

  echo "Waiting for healthchecks..."

  for attempt in $(seq 1 "$attempts"); do
    web_ok=0
    api_ok=0

    if curl -kfsS -H "Host: ${web_host}" https://127.0.0.1/api/health >/dev/null 2>&1; then
      web_ok=1
    fi

    if curl -kfsS -H "Host: ${api_host}" https://127.0.0.1/health >/dev/null 2>&1; then
      api_ok=1
    fi

    if [ "$web_ok" -eq 1 ] && [ "$api_ok" -eq 1 ]; then
      echo "Healthchecks passed"
      return 0
    fi

    echo "Healthcheck attempt ${attempt}/${attempts} failed, retrying in ${sleep_seconds}s..."
    sleep "$sleep_seconds"
  done

  return 1
}

PREVIOUS_WEB_IMAGE="$(get_env_var "WEB_IMAGE" "$ENV_FILE")"
PREVIOUS_API_IMAGE="$(get_env_var "API_IMAGE" "$ENV_FILE")"
WEB_HOST_VALUE="$(get_env_var "WEB_HOST" "$ENV_FILE")"
API_HOST_VALUE="$(get_env_var "API_HOST" "$ENV_FILE")"

echo "Deploying environment: $ENVIRONMENT"
echo "Previous web image: $PREVIOUS_WEB_IMAGE"
echo "Previous api image: $PREVIOUS_API_IMAGE"
echo "New web image: $WEB_IMAGE_VALUE"
echo "New api image: $API_IMAGE_VALUE"

update_env_var "WEB_IMAGE" "$WEB_IMAGE_VALUE" "$ENV_FILE"
update_env_var "API_IMAGE" "$API_IMAGE_VALUE" "$ENV_FILE"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

if ! wait_for_healthchecks "$WEB_HOST_VALUE" "$API_HOST_VALUE"; then
  rollback
fi

rm -f "${ENV_FILE}.bak"

echo "Deploy finished for $ENVIRONMENT"
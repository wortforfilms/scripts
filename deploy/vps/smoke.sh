#!/usr/bin/env bash
set -euo pipefail

APP_BASE_URL="${APP_BASE_URL:-http://127.0.0.1:3000}"
RADIO_STREAM_URL="${RADIO_STREAM_URL:-}"

echo "Smoke: ${APP_BASE_URL}"

health_json="$(curl -fsS "${APP_BASE_URL}/api/health")"
echo "${health_json}" | grep -q '"ok":true'

radio_config_json="$(curl -fsS "${APP_BASE_URL}/api/radio/config")"
echo "${radio_config_json}" | grep -q '"streamUrl"'

runtime_radio_json="$(curl -fsS "${APP_BASE_URL}/api/runtime/radio")"
echo "${runtime_radio_json}" | grep -q '"queue"'

if [ -n "${RADIO_STREAM_URL}" ]; then
  curl -fsSI "${RADIO_STREAM_URL}" >/dev/null
fi

echo "Smoke checks passed"

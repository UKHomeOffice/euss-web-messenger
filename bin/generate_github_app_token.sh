#!/bin/bash

set -euo pipefail

# Required environment variables
: "${GITHUB_APP_ID:?Missing GITHUB_APP_ID}"
: "${GITHUB_APP_PRIVATE_KEY:?Missing GITHUB_APP_PRIVATE_KEY}"

# Optional environment variables
# - GITHUB_APP_INSTALLATION_ID: if not set, script discovers installation from repo
# - DRONE_REPO or GIT_REPO: needed for installation discovery fallback

OUTPUT_TOKEN_FILE="${OUTPUT_TOKEN_FILE:-/root/.dockersock/github_app_token.txt}"

cleanup() {
  rm -f /tmp/github_app_private_key.pem
}
trap cleanup EXIT

printf '%b' "${GITHUB_APP_PRIVATE_KEY}" > /tmp/github_app_private_key.pem
chmod 600 /tmp/github_app_private_key.pem

b64url() {
  openssl base64 -A | tr "+/" "-_" | tr -d "="
}

APP_ID="$(printf "%s" "${GITHUB_APP_ID}" | tr -d "[:space:]")"
INSTALLATION_ID="$(printf "%s" "${GITHUB_APP_INSTALLATION_ID:-}" | tr -d "[:space:]")"
REPO_SLUG="$(printf "%s" "${DRONE_REPO:-${GIT_REPO:-}}" | tr -d "[:space:]")"

[[ "${APP_ID}" =~ ^[0-9]+$ ]] || { echo "GITHUB_APP_ID must be numeric"; exit 1; }
if [ -n "${INSTALLATION_ID}" ] && ! [[ "${INSTALLATION_ID}" =~ ^[0-9]+$ ]]; then
  echo "GITHUB_APP_INSTALLATION_ID must be numeric"
  exit 1
fi

NOW=$(date +%s)
EXP=$((NOW + 540))
HEADER_B64=$(printf "{\"alg\":\"RS256\",\"typ\":\"JWT\"}" | b64url)
PAYLOAD_B64=$(printf "{\"iat\":%s,\"exp\":%s,\"iss\":\"%s\"}" "${NOW}" "${EXP}" "${APP_ID}" | b64url)
UNSIGNED_TOKEN="${HEADER_B64}.${PAYLOAD_B64}"
SIGNATURE_B64=$(printf "%s" "${UNSIGNED_TOKEN}" | openssl dgst -binary -sha256 -sign /tmp/github_app_private_key.pem | b64url)
JWT="${UNSIGNED_TOKEN}.${SIGNATURE_B64}"

APP_RESPONSE=$(curl -sS \
  -H "Authorization: Bearer ${JWT}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/app")
APP_SLUG=$(echo "${APP_RESPONSE}" | jq -r '.slug // empty')
APP_ID_FROM_API=$(echo "${APP_RESPONSE}" | jq -r '.id // empty')
test -n "${APP_SLUG}" || (echo "Failed to authenticate as GitHub App using provided APP_ID/private key" && echo "${APP_RESPONSE}" && exit 1)

echo "Authenticated GitHub App: ${APP_SLUG} (id: ${APP_ID_FROM_API})"

if [ -z "${INSTALLATION_ID}" ]; then
  [ -n "${REPO_SLUG}" ] || { echo "Missing repo slug for installation discovery (DRONE_REPO/GIT_REPO)"; exit 1; }
  INSTALLATION_RESPONSE=$(curl -sS \
    -H "Authorization: Bearer ${JWT}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/${REPO_SLUG}/installation")
  INSTALLATION_ID=$(echo "${INSTALLATION_RESPONSE}" | jq -r '.id // empty')
  test -n "${INSTALLATION_ID}" || (echo "Failed to discover app installation for ${REPO_SLUG}. Ensure app ${APP_SLUG} is installed on this repo (or included in selected repositories)." && echo "${INSTALLATION_RESPONSE}" && exit 1)
fi

echo "Attempting GitHub App token generation for repo ${REPO_SLUG:-unknown} using installation ${INSTALLATION_ID}"

request_installation_token() {
  local installation_id="$1"
  curl -sS -X POST \
    -H "Authorization: Bearer ${JWT}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/app/installations/${installation_id}/access_tokens"
}

TOKEN_RESPONSE="$(request_installation_token "${INSTALLATION_ID}")"
TOKEN="$(echo "${TOKEN_RESPONSE}" | jq -r '.token // empty')"

# If the configured installation ID is stale/wrong, retry by discovering installation from repo.
if [ -z "${TOKEN}" ] && [ "$(echo "${TOKEN_RESPONSE}" | jq -r '.status // empty')" = "404" ]; then
  [ -n "${REPO_SLUG}" ] || { echo "Missing repo slug for 404 recovery (DRONE_REPO/GIT_REPO)"; exit 1; }
  echo "Installation ${INSTALLATION_ID} not found for this app. Discovering installation from repo ${REPO_SLUG}..."
  INSTALLATION_RESPONSE=$(curl -sS \
    -H "Authorization: Bearer ${JWT}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/${REPO_SLUG}/installation")
  DISCOVERED_INSTALLATION_ID=$(echo "${INSTALLATION_RESPONSE}" | jq -r '.id // empty')
  test -n "${DISCOVERED_INSTALLATION_ID}" || (echo "Failed to discover app installation for ${REPO_SLUG}. Ensure app ${APP_SLUG} is installed on this repo (or included in selected repositories)." && echo "${INSTALLATION_RESPONSE}" && exit 1)
  INSTALLATION_ID="${DISCOVERED_INSTALLATION_ID}"
  echo "Retrying token generation with discovered installation ${INSTALLATION_ID}"
  TOKEN_RESPONSE="$(request_installation_token "${INSTALLATION_ID}")"
  TOKEN="$(echo "${TOKEN_RESPONSE}" | jq -r '.token // empty')"
fi

test -n "${TOKEN}" || (echo "Failed to create GitHub App installation token" && echo "${TOKEN_RESPONSE}" && exit 1)

mkdir -p "$(dirname "${OUTPUT_TOKEN_FILE}")"
printf "%s" "${TOKEN}" > "${OUTPUT_TOKEN_FILE}"
chmod 600 "${OUTPUT_TOKEN_FILE}"
        
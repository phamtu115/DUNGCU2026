#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Cách dùng: $0 https://ten-domain.vercel.app"
  exit 2
fi

BASE="${1%/}"
HEALTH_URL="$BASE/api/health?deep=1"
RESPONSE="$(curl --fail --silent --show-error "$HEALTH_URL")"
printf '%s\n' "$RESPONSE"

printf '%s' "$RESPONSE" | node --input-type=module -e '
let body = "";
process.stdin.on("data", (chunk) => body += chunk);
process.stdin.on("end", () => {
  const value = JSON.parse(body);
  const ok = value.ok === true &&
    value.supabaseConfigured === true &&
    value.accessKeyConfigured === true &&
    value.databaseReachable === true;
  if (!ok) {
    console.error("PRODUCTION HEALTH: KHÔNG ĐẠT");
    process.exit(1);
  }
  console.log("PRODUCTION HEALTH: ĐẠT");
});
'

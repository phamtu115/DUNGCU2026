#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

command -v vercel >/dev/null 2>&1 || {
  echo "Chưa cài Vercel CLI. Chạy: npm install --global vercel" >&2
  exit 1
}

cd "$ROOT"
npm run check

DEPLOY_ARGS=(deploy --cwd "$ROOT" --yes)
if [[ "${1:-}" == "--prod" || "${1:-}" == "--production" ]]; then
  DEPLOY_ARGS+=(--prod)
fi
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  DEPLOY_ARGS+=(--token "$VERCEL_TOKEN")
fi

vercel "${DEPLOY_ARGS[@]}"

#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "Chưa cài Node.js 20 trở lên." >&2
  exit 1
fi

NODE_VERSION="$(node --version)"
NODE_MAJOR="${NODE_VERSION#v}"
NODE_MAJOR="${NODE_MAJOR%%.*}"
if (( NODE_MAJOR < 20 )); then
  echo "Node.js hiện tại là $NODE_VERSION. Cần Node.js 20 trở lên." >&2
  exit 1
fi

command -v npm >/dev/null 2>&1 || {
  echo "Không tìm thấy npm." >&2
  exit 1
}

for required in \
  package.json \
  vercel.json \
  supabase/migrations/001_hotel_manager.sql \
  scripts/build-check.mjs; do
  [[ -f "$ROOT/$required" ]] || {
    echo "Thiếu tệp bắt buộc: $required" >&2
    exit 1
  }
done

cd "$ROOT"
npm run check

echo "ENVIRONMENT CHECK: ĐẠT · Node $NODE_VERSION · npm sẵn sàng"

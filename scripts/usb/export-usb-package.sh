#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ $# -lt 1 ]]; then
  echo "Cách dùng: $0 /đường/dẫn/đến/USB [--force]"
  exit 2
fi

node "$ROOT/scripts/usb/export-usb-package.mjs" \
  --source "$ROOT" \
  --destination "$1" \
  "${@:2}"

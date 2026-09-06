#requires -Version 5.1
[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Error "Chưa cài Node.js 20 trở lên."
  exit 1
}

$version = (& $node.Source --version).Trim()
$major = [int](($version -replace "^v", "").Split(".")[0])
if ($major -lt 20) {
  Write-Error "Node.js hiện tại là $version. Cần Node.js 20 trở lên."
  exit 1
}

$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
  Write-Error "Không tìm thấy npm."
  exit 1
}

foreach ($required in @(
  "package.json",
  "vercel.json",
  "supabase/migrations/001_hotel_manager.sql",
  "scripts/build-check.mjs"
)) {
  if (-not (Test-Path (Join-Path $root $required))) {
    Write-Error "Thiếu tệp bắt buộc: $required"
    exit 1
  }
}

Push-Location $root
try {
  npm run check
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}

Write-Host "ENVIRONMENT CHECK: ĐẠT · Node $version · npm sẵn sàng"

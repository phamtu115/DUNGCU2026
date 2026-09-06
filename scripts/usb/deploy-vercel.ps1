#requires -Version 5.1
[CmdletBinding()]
param(
  [switch]$Production
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$vercel = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercel) {
  Write-Error "Chưa cài Vercel CLI. Chạy: npm install --global vercel"
  exit 1
}

Push-Location $root
try {
  npm run check
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  $deployArgs = @("deploy", "--cwd", $root, "--yes")
  if ($Production) { $deployArgs += "--prod" }
  if ($env:VERCEL_TOKEN) {
    $deployArgs += @("--token", $env:VERCEL_TOKEN)
  }

  & $vercel.Source @deployArgs
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}

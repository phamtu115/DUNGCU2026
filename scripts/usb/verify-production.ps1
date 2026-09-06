#requires -Version 5.1
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Url
)

$ErrorActionPreference = "Stop"
$base = $Url.TrimEnd("/")
$healthUrl = "$base/api/health?deep=1"

try {
  $result = Invoke-RestMethod -Uri $healthUrl -Method Get
} catch {
  Write-Error "Không gọi được $healthUrl : $($_.Exception.Message)"
  exit 1
}

$result | ConvertTo-Json -Depth 5
if (
  $result.ok -ne $true -or
  $result.supabaseConfigured -ne $true -or
  $result.accessKeyConfigured -ne $true -or
  $result.databaseReachable -ne $true
) {
  Write-Error "PRODUCTION HEALTH: KHÔNG ĐẠT"
  exit 1
}

Write-Host "PRODUCTION HEALTH: ĐẠT"

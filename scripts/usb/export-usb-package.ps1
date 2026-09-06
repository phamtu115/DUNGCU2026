#requires -Version 5.1
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Destination,

  [switch]$Force
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$node = Get-Command node -ErrorAction Stop
$script = Join-Path $PSScriptRoot "export-usb-package.mjs"

$args = @("--source", $root, "--destination", $Destination)
if ($Force) { $args += "--force" }

& $node.Source $script @args
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

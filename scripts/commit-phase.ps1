param(
  [Parameter(Mandatory = $true)]
  [string]$File,

  [Parameter(Mandatory = $true)]
  [string]$Message
)

$ErrorActionPreference = "Continue"
$dash = "-"

if (-not (Test-Path -LiteralPath $File)) {
  Write-Host "ERROR: $File $dash file not found in working tree"
  exit 1
}

git add "$File"
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERROR: $File $dash git add failed"
  exit 1
}

$commitOutput = git commit -m $Message 2>&1
if ($LASTEXITCODE -eq 0) {
  $hash = ""
  foreach ($line in $commitOutput) {
    if ($line -match '^\[[^\s]+ ([0-9a-f]+)\]') {
      $hash = $Matches[1]
      break
    }
  }

  Write-Host "OK: $File $dash $hash $Message"
  exit 0
}

Write-Host "ERROR: $File $dash git commit failed"
$commitOutput | ForEach-Object { Write-Host $_ }
exit 1

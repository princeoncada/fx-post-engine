$ErrorActionPreference = "Continue"

$passCount = 0
$failCount = 0

function Pass-Check {
  param([string]$Description)
  $script:passCount += 1
  Write-Host "PASS : $Description"
}

function Fail-Check {
  param(
    [string]$Description,
    [string]$Detail = ""
  )
  $script:failCount += 1
  if ($Detail -ne "") {
    Write-Host "FAIL : $Description - $Detail"
  } else {
    Write-Host "FAIL : $Description"
  }
}

$diffCheckLabel = "git diff --check"
$diffCheckOutput = git diff --check 2>&1
if ($LASTEXITCODE -eq 0) {
  Pass-Check $diffCheckLabel
} else {
  Fail-Check $diffCheckLabel (($diffCheckOutput | Out-String).Trim())
}

$jsonLabel = "package JSON parse"
try {
  node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('package-lock.json','utf8'));" 2>&1 | Out-Null
  if ($LASTEXITCODE -eq 0) {
    Pass-Check $jsonLabel
  } else {
    Fail-Check $jsonLabel "node JSON parse command failed"
  }
} catch {
  Fail-Check $jsonLabel $_.Exception.Message
}

$lockVersionLabel = "package-lock project metadata version sync"
try {
  $lockVersionScript = @'
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
const root = lock.packages && lock.packages[""];

if (lock.version !== pkg.version) {
  throw new Error(`package-lock top-level version ${lock.version} does not match package.json ${pkg.version}`);
}

if (!root) {
  throw new Error('package-lock missing packages[""] root entry');
}

if (root.version !== pkg.version) {
  throw new Error(`package-lock packages[""] version ${root.version} does not match package.json ${pkg.version}`);
}
'@
  $tempScript = Join-Path $env:TEMP "fx-post-engine-lock-version-check.js"
  Set-Content -LiteralPath $tempScript -Value $lockVersionScript -Encoding utf8
  try {
    $lockVersionOutput = node $tempScript 2>&1
    if ($LASTEXITCODE -eq 0) {
      Pass-Check $lockVersionLabel
    } else {
      Fail-Check $lockVersionLabel (($lockVersionOutput | Out-String).Trim())
    }
  } finally {
    if (Test-Path -LiteralPath $tempScript) {
      Remove-Item -LiteralPath $tempScript -Force
    }
  }
} catch {
  Fail-Check $lockVersionLabel $_.Exception.Message
}

$mojibakeLabel = "mojibake scan - docs, root docs, scripts"
$badSequences = @(
  ([string]([char]0x00E2) + [string]([char]0x20AC)),
  ([string]([char]0x00C3) + [string]([char]0x00D7)),
  ([string]([char]0x00E2) + [string]([char]0x2020)),
  ([string]([char]0x00E2) + [string]([char]0x20AC) + [string]([char]0x02DC)),
  ([string]([char]0x00E2) + [string]([char]0x20AC) + [string]([char]0x2122)),
  ([string]([char]0x00E2) + [string]([char]0x20AC) + [string]([char]0x0153))
)

$scanFiles = @()
if (Test-Path -LiteralPath "docs") {
  $scanFiles += Get-ChildItem -LiteralPath "docs" -Recurse -File | Where-Object { $_.Extension -in ".md", ".ps1" }
}
foreach ($file in @("README.md", "CLAUDE.md", "AGENTS.md", "master_prompt.md")) {
  if (Test-Path -LiteralPath $file) {
    $scanFiles += Get-Item -LiteralPath $file
  }
}
if (Test-Path -LiteralPath "scripts") {
  $scanFiles += Get-ChildItem -LiteralPath "scripts" -Recurse -File | Where-Object { $_.Extension -in ".md", ".ps1" }
}

$matches = $scanFiles | Select-String -Pattern $badSequences
if (($null -eq $matches) -or ($matches.Count -eq 0)) {
  Pass-Check $mojibakeLabel
} else {
  $files = $matches | Select-Object -ExpandProperty Path -Unique
  Fail-Check $mojibakeLabel ("$($matches.Count) matches in " + (($files | ForEach-Object { Split-Path -Leaf $_ }) -join ", "))
}

$tsLabel = "npx tsc --noEmit"
$tsOutput = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
  Pass-Check $tsLabel
} else {
  Fail-Check $tsLabel (($tsOutput | Select-Object -Last 40 | Out-String).Trim())
}

$testLabel = "npm test"
$testOutput = npm test 2>&1
if ($LASTEXITCODE -eq 0) {
  Pass-Check $testLabel
} else {
  Fail-Check $testLabel (($testOutput | Select-Object -Last 40 | Out-String).Trim())
}

$buildLabel = "npm run build"
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
  Pass-Check $buildLabel
} else {
  Fail-Check $buildLabel (($buildOutput | Select-Object -Last 40 | Out-String).Trim())
}

$totalCount = $passCount + $failCount
if ($failCount -eq 0) {
  Write-Host "OVERALL PASS ($passCount/$totalCount checks passed)"
  exit 0
}

Write-Host "OVERALL FAIL ($passCount/$totalCount checks passed, $failCount failed)"
exit 1

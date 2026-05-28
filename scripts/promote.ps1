# Promotes the current alpha documentation version to stable.
# Usage: .\scripts\promote.ps1
# Usage with explicit version: .\scripts\promote.ps1 -Version "1.1.0"

param(
  [string]$Version = ""
)

$ErrorActionPreference = "Stop"

function Get-CurrentDocVersion {
  $handoff = Get-Content -LiteralPath "docs/AI_HANDOFF.md" -Raw
  if ($handoff -match '\*\*Version:\*\*\s+([0-9]+\.[0-9]+\.[0-9]+)-(alpha|beta|stable)') {
    return @{
      Base = $Matches[1]
      State = $Matches[2]
      Full = "$($Matches[1])-$($Matches[2])"
    }
  }

  throw "Could not find current version in docs/AI_HANDOFF.md"
}

function Set-PackageVersion {
  param([string]$BaseVersion)

  $packagePath = "package.json"
  $packageContent = Get-Content -LiteralPath $packagePath -Raw
  $packageContent = [regex]::Replace(
    $packageContent,
    '("version":\s*")[^"]+(")',
    { param($match) $match.Groups[1].Value + $BaseVersion + $match.Groups[2].Value },
    1
  )
  Set-Content -LiteralPath $packagePath -Value $packageContent -Encoding utf8
  Write-Host "  Updated package.json"

  $lockPath = "package-lock.json"
  if (Test-Path -LiteralPath $lockPath) {
    $lockContent = Get-Content -LiteralPath $lockPath -Raw
    $lockContent = [regex]::Replace(
      $lockContent,
      '("version":\s*")[^"]+(")',
      { param($match) $match.Groups[1].Value + $BaseVersion + $match.Groups[2].Value },
      1
    )
    $lockContent = [regex]::Replace(
      $lockContent,
      '("":\s*\{[\s\S]*?"version":\s*")[^"]+(")',
      { param($match) $match.Groups[1].Value + $BaseVersion + $match.Groups[2].Value },
      1
    )
    Set-Content -LiteralPath $lockPath -Value $lockContent -Encoding utf8
    Write-Host "  Updated package-lock.json"
  }
}

$current = Get-CurrentDocVersion

if ($Version -eq "") {
  if ($current.State -ne "alpha") {
    Write-Error "Current version '$($current.Full)' is not alpha. Nothing to promote."
    exit 1
  }

  $Version = $current.Base
}

$alphaVersion = "$Version-alpha"
$stableVersion = "$Version-stable"

Write-Host "Promoting $alphaVersion to $stableVersion"

$docFiles = @(
  "docs/VERSIONING.md",
  "docs/AI_HANDOFF.md",
  "docs/PHASE_LOG.md",
  "docs/FUTURE_PLANS.md",
  "master_prompt.md"
)

foreach ($file in $docFiles) {
  if (-not (Test-Path -LiteralPath $file)) {
    continue
  }

  $content = Get-Content -LiteralPath $file -Raw
  $updated = $content -replace [regex]::Escape($alphaVersion), $stableVersion
  Set-Content -LiteralPath $file -Value $updated -Encoding utf8
  Write-Host "  Updated $file"
}

$versioningPath = "docs/VERSIONING.md"
if (Test-Path -LiteralPath $versioningPath) {
  $content = Get-Content -LiteralPath $versioningPath -Raw
  $content = $content -replace '(\| State\s+\|\s+)alpha(\s+\|)', '${1}stable${2}'
  $content = $content -replace ("(\| " + [regex]::Escape($stableVersion) + " \| )alpha( \|)"), '${1}stable${2}'
  Set-Content -LiteralPath $versioningPath -Value $content -Encoding utf8
  Write-Host "  Fixed State fields in docs/VERSIONING.md"
}

$phaseLogPath = "docs/PHASE_LOG.md"
if (Test-Path -LiteralPath $phaseLogPath) {
  $content = Get-Content -LiteralPath $phaseLogPath -Raw
  $content = $content -replace ("(\| " + [regex]::Escape($stableVersion) + " \| )alpha( \|)"), '${1}stable${2}'
  $content = $content -replace '(\*\*Status:\*\*\s+)alpha', '${1}stable'
  Set-Content -LiteralPath $phaseLogPath -Value $content -Encoding utf8
  Write-Host "  Fixed State fields in docs/PHASE_LOG.md"
}

$handoffPath = "docs/AI_HANDOFF.md"
if (Test-Path -LiteralPath $handoffPath) {
  $content = Get-Content -LiteralPath $handoffPath -Raw
  $content = $content -replace '(\*\*Status:\*\*\s+)alpha', '${1}stable'
  Set-Content -LiteralPath $handoffPath -Value $content -Encoding utf8
  Write-Host "  Fixed Status field in docs/AI_HANDOFF.md"
}

Set-PackageVersion -BaseVersion $Version

Write-Host ""
Write-Host "Done. Run git status to see changed files."
Write-Host "Commit each changed file separately with scripts/commit-phase.ps1."

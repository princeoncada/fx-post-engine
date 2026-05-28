# Promotes the current alpha documentation version to stable.
# Usage: .\scripts\promote.ps1
# Usage with explicit version: .\scripts\promote.ps1 -Version "1.1.0"

param(
  [string]$Version = ""
)

$ErrorActionPreference = "Stop"

$dirtyFiles = git status --porcelain
if ($LASTEXITCODE -ne 0) {
  Write-Error "Could not inspect git status. Promotion aborted."
  exit 1
}

if ($dirtyFiles) {
  Write-Error "Working tree is not clean. Commit the alpha version first, then run promotion."
  $dirtyFiles | ForEach-Object { Write-Host "  $_" }
  exit 1
}

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
  if ($packageContent -ne (Get-Content -LiteralPath $packagePath -Raw)) {
    Set-Content -LiteralPath $packagePath -Value $packageContent -Encoding utf8
    Write-Host "  Updated package.json"
  }

  $lockPath = "package-lock.json"
  if (Test-Path -LiteralPath $lockPath) {
    $lockContent = Get-Content -LiteralPath $lockPath -Raw
    $originalLockContent = $lockContent
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
    if ($lockContent -ne $originalLockContent) {
      Set-Content -LiteralPath $lockPath -Value $lockContent -Encoding utf8
      Write-Host "  Updated package-lock.json"
    }
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
  if ($updated -ne $content) {
    Set-Content -LiteralPath $file -Value $updated -Encoding utf8
    Write-Host "  Updated $file"
  }
}

$versioningPath = "docs/VERSIONING.md"
if (Test-Path -LiteralPath $versioningPath) {
  $content = Get-Content -LiteralPath $versioningPath -Raw
  $content = $content -replace '(\| State\s+\|\s+)alpha(\s+\|)', '${1}stable${2}'
  $content = $content -replace ("(\| " + [regex]::Escape($stableVersion) + " \| )alpha( \|)"), '${1}stable${2}'
  if ($content -ne (Get-Content -LiteralPath $versioningPath -Raw)) {
    Set-Content -LiteralPath $versioningPath -Value $content -Encoding utf8
    Write-Host "  Fixed State fields in docs/VERSIONING.md"
  }
}

$phaseLogPath = "docs/PHASE_LOG.md"
if (Test-Path -LiteralPath $phaseLogPath) {
  $content = Get-Content -LiteralPath $phaseLogPath -Raw
  $content = $content -replace ("(\| " + [regex]::Escape($stableVersion) + " \| )alpha( \|)"), '${1}stable${2}'
  $phasePattern = "(## \[" + [regex]::Escape($stableVersion) + "\][\s\S]*?)(\n---)"
  $content = [regex]::Replace(
    $content,
    $phasePattern,
    {
      param($match)
      ($match.Groups[1].Value -replace '(\*\*Status:\*\*\s+)alpha', '${1}stable') + $match.Groups[2].Value
    },
    1
  )
  if ($content -ne (Get-Content -LiteralPath $phaseLogPath -Raw)) {
    Set-Content -LiteralPath $phaseLogPath -Value $content -Encoding utf8
    Write-Host "  Fixed State fields in docs/PHASE_LOG.md"
  }
}

$handoffPath = "docs/AI_HANDOFF.md"
if (Test-Path -LiteralPath $handoffPath) {
  $content = Get-Content -LiteralPath $handoffPath -Raw
  $content = $content -replace '(\*\*Status:\*\*\s+)alpha', '${1}stable'
  if ($content -ne (Get-Content -LiteralPath $handoffPath -Raw)) {
    Set-Content -LiteralPath $handoffPath -Value $content -Encoding utf8
    Write-Host "  Fixed Status field in docs/AI_HANDOFF.md"
  }
}

$futurePlansPath = "docs/FUTURE_PLANS.md"
if (Test-Path -LiteralPath $futurePlansPath) {
  $content = Get-Content -LiteralPath $futurePlansPath -Raw
  $content = $content -replace '(\*\*Current stable version:\*\*\s+)[0-9]+\.[0-9]+\.[0-9]+-stable', ("`${1}" + $stableVersion)
  if ($content -ne (Get-Content -LiteralPath $futurePlansPath -Raw)) {
    Set-Content -LiteralPath $futurePlansPath -Value $content -Encoding utf8
    Write-Host "  Fixed current stable version in docs/FUTURE_PLANS.md"
  }
}

Set-PackageVersion -BaseVersion $Version

Write-Host ""
Write-Host "Done. Run git status to see changed files."
Write-Host "Commit each changed file separately with scripts/commit-phase.ps1."

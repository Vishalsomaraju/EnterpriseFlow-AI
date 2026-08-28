# EnterpriseFlow Demo Reset (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "=== EnterpriseFlow Demo Reset ===" -ForegroundColor Cyan

$RootDir = (Get-Item $PSScriptRoot).Parent.FullName
$DemoRepo = Join-Path $RootDir "demo-repository\invoice-automation"
$BaselineDir = Join-Path $RootDir "demo-repository\invoice-automation-baseline"
$BobWorkspace = Join-Path $RootDir "bob-workspace"

# 1. Restore demo repository from baseline
Write-Host "[1/4] Restoring demo-repository to clean baseline..." -ForegroundColor Yellow
if (Test-Path $DemoRepo) {
    Remove-Item $DemoRepo -Recurse -Force
}
Copy-Item $BaselineDir $DemoRepo -Recurse -Force

# 2. Reset git in demo repository
Write-Host "[2/4] Initializing clean git history in demo repository..." -ForegroundColor Yellow
Push-Location $DemoRepo
try {
    git init -q
    git config user.email "bob@enterpriseflow.ai"
    git config user.name "IBM Bob"
    git add -A
    git commit -q -m "baseline: invoice automation with known deficiencies (4 tests pass, 18 acceptance criteria pending)"
} finally {
    Pop-Location
}

# 3. Clean up bob-workspace evidence artifacts
Write-Host "[3/4] Cleaning bob-workspace evidence directories..." -ForegroundColor Yellow
$evidenceDirs = @("plans", "activities", "changes", "tests", "security", "documentation")
foreach ($dir in $evidenceDirs) {
    $targetPath = Join-Path $BobWorkspace $dir
    if (-not (Test-Path $targetPath)) {
        New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    } else {
        Get-ChildItem -Path $targetPath -File | Remove-Item -Force -ErrorAction SilentlyContinue
    }
}

# 4. Reset and re-seed database
Write-Host "[4/4] Resetting and re-seeding database..." -ForegroundColor Yellow
Push-Location (Join-Path $RootDir "backend")
try {
    npx tsx src/db/reset.ts
} finally {
    Pop-Location
}

Write-Host "=== ✅ Demo environment reset successfully! ===" -ForegroundColor Green

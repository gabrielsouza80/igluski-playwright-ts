# Script para criar Pull Request automaticamente
# Uso: .\create-pr.ps1

param(
    [string]$BaseBranch = "develop"
)

Write-Host "Creating Pull Request automatically..." -ForegroundColor Cyan
# Fetch latest changes
Write-Host "Fetching latest changes from origin..." -ForegroundColor Yellow
git fetch origin


# Pegar branch atual
$currentBranch = git branch --show-current
Write-Host "Current Branch: $currentBranch" -ForegroundColor Green
Write-Host "Target Branch: $BaseBranch" -ForegroundColor Green

# Verificar se tem mudanças para commit
$status = git status --porcelain
if ($status) {
    Write-Host "Committing pending changes..." -ForegroundColor Yellow
    git add .
    git commit -m "chore: prepare PR"
}

# Push do branch
Write-Host "Pushing to origin..." -ForegroundColor Yellow
git push origin $currentBranch

Write-Host ""
Write-Host "Analyzing changes since last PR..." -ForegroundColor Cyan

# Pegar commits desde develop
$commits = git log origin/$BaseBranch..$currentBranch --pretty=format:"%s" | Out-String

# Pegar arquivos modificados
$filesChanged = git diff --name-only origin/$BaseBranch..$currentBranch | Out-String

# Pegar estatísticas
$stats = git diff --stat origin/$BaseBranch..$currentBranch | Select-Object -Last 1

# Detectar tipo de mudança baseado nos commits
$isBugFix = $commits -match "fix:"
$isFeature = $commits -match "feat:"
$isRefactor = $commits -match "refactor:"
$isDocs = $commits -match "docs:"

# Gerar título automaticamente
$title = ""
if ($isFeature) { $title = "feat: " }
elseif ($isBugFix) { $title = "fix: " }
elseif ($isRefactor) { $title = "refactor: " }
elseif ($isDocs) { $title = "docs: " }
else { $title = "chore: " }

# Pegar primeira linha do último commit como título
$lastCommitTitle = git log -1 --pretty=format:"%s"
$title += $lastCommitTitle

# Gerar body do PR automaticamente
$prBody = @"
# Pull Request

## Description

**Branch:** ``$currentBranch`` → ``$BaseBranch``

### Summary of Changes
$commits

### Files Modified
``````
$filesChanged
``````

### Statistics
``````
$stats
``````

## Type of change

"@

if ($isBugFix) { $prBody += "`n- [x] Bug fix (non-breaking change which fixes an issue)" }
else { $prBody += "`n- [ ] Bug fix (non-breaking change which fixes an issue)" }

if ($isFeature) { $prBody += "`n- [x] New feature (non-breaking change which adds functionality)" }
else { $prBody += "`n- [ ] New feature (non-breaking change which adds functionality)" }

$prBody += @"

- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?

### Browsers Tested
- [ ] Chromium
- [ ] Firefox
- [ ] WebKit

### Test Results
``````
[Paste test execution results here]
``````

## Checklist:

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
"@

Write-Host ""
Write-Host "PR Title: $title" -ForegroundColor Yellow
Write-Host ""

# Criar URL para GitHub (sem encoding complexo)
$prUrl = "https://github.com/gabrielsouza80/igluski-playwright-ts/compare/$BaseBranch...$currentBranch"

# Salvar o body em arquivo temporário
$prBody | Out-File -FilePath "pr-body-temp.txt" -Encoding UTF8

Write-Host "Opening browser..." -ForegroundColor Cyan
Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Browser will open GitHub compare page" -ForegroundColor Gray
Write-Host "2. Click 'Create pull request' button" -ForegroundColor Gray
Write-Host "3. Copy content from 'pr-body-temp.txt' to PR description" -ForegroundColor Gray
Write-Host "4. Update title if needed: $title" -ForegroundColor Gray
Write-Host "5. Click 'Create pull request' again" -ForegroundColor Gray
Write-Host ""

# Abrir navegador e arquivo
Start-Process $prUrl
Start-Sleep -Seconds 1
notepad "pr-body-temp.txt"

Write-Host ""
Write-Host "Done! Follow the instructions above." -ForegroundColor Green

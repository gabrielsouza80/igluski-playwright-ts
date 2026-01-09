# Script para criar Pull Request automaticamente
# Uso: .\create-pr.ps1

Write-Host "Creating Pull Request automatically..." -ForegroundColor Cyan

# Verificar se estamos no branch correto
$currentBranch = git branch --show-current
if ($currentBranch -ne "CreateFunctionsSearch") {
    Write-Host "Wrong branch. Expected: CreateFunctionsSearch, Current: $currentBranch" -ForegroundColor Red
    exit 1
}

Write-Host "Branch: $currentBranch" -ForegroundColor Green

# Verificar se tem mudanças para commit
$status = git status --porcelain
if ($status) {
    Write-Host "Committing pending changes..." -ForegroundColor Yellow
    git add .
    git commit -m "docs: Add PR template and documentation"
}

# Push do branch
Write-Host "Pushing to origin..." -ForegroundColor Yellow
git push origin CreateFunctionsSearch

# Ler o conteúdo do PR
$prBody = Get-Content "PR_READY_TO_PASTE.md" -Raw

# Criar PR usando API do GitHub
$title = "feat: Search and Filter Tests Enhancement + Critical Flakiness Fixes"
$base = "main"
$head = "CreateFunctionsSearch"

Write-Host "Creating Pull Request..." -ForegroundColor Cyan
Write-Host "   Title: $title" -ForegroundColor Gray
Write-Host "   Base: $base <- Head: $head" -ForegroundColor Gray

# Criar URL para abrir PR no navegador com dados pre-preenchidos
$encodedTitle = [System.Web.HttpUtility]::UrlEncode($title)
$encodedBody = [System.Web.HttpUtility]::UrlEncode($prBody)
$prUrl = "https://github.com/gabrielsouza80/igluski-playwright-ts/compare/main...CreateFunctionsSearch?expand=1&title=$encodedTitle&body=$encodedBody"

Write-Host ""
Write-Host "Branch pushed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Opening browser to create PR..." -ForegroundColor Cyan
Write-Host "   (Just click Create Pull Request button)" -ForegroundColor Gray

# Abrir navegador
Start-Process $prUrl

Write-Host ""
Write-Host "Done! Browser opened with PR pre-filled." -ForegroundColor Green
Write-Host "  Just review and click Create Pull Request" -ForegroundColor Gray

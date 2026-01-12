$file = "C:\Gabriel\projects\playwright\igluski-playwright-ts\pages\search.page.ts"
$content = Get-Content $file -Raw -Encoding UTF8

# Fix dropdown timeout line 356
$content = $content -replace "await dropdownMenu\.waitFor\(\{ state: 'visible' \}\)\.catch", "await dropdownMenu.waitFor({ state: 'visible', timeout: 30000 }).catch"

# Fix retry waitFor line 361
$content = $content -replace "(\s+await this\.nightsButton\.click\(\{ force: true \}\);\r?\n\s+await dropdownMenu\.waitFor\(\{ state: 'visible' \}\);)", "`$1`r`n        await dropdownMenu.waitFor({ state: 'visible', timeout: 30000 }); // Another 30s for retry"

# Fix reopen after Deselect All line 387
$content = $content -replace "(await this\.nightsButton\.click\(\);\r?\n\s+await dropdownMenu\.waitFor\(\{ state: 'visible' \}\);)", "await this.nightsButton.click();`r`n        await dropdownMenu.waitFor({ state: 'visible', timeout: 30000 }); // 30s timeout for reopen"

Set-Content $file -Value $content -Encoding UTF8 -NoNewline
Write-Host "Fixed dropdown timeouts!"

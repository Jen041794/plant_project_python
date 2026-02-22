# ============================================================
#  PhytoScan 套件安裝腳本
#  執行方式：把此檔放在專案根目錄，用 PowerShell 執行
#  > .\install_all.ps1
# ============================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  PhytoScan 套件安裝腳本" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# ── 檢查 Python ──────────────────────────────────────────────
Write-Host "[1/4] 檢查 Python..." -ForegroundColor Cyan
try {
    $pyver = py --version 2>&1
    Write-Host "  OK $pyver" -ForegroundColor Green
} catch {
    Write-Host "  ERROR 找不到 Python！請先安裝：https://www.python.org/downloads/" -ForegroundColor Red
    Write-Host "        安裝時記得勾選 Add Python to PATH" -ForegroundColor Yellow
    exit 1
}

# ── 檢查 Node.js ─────────────────────────────────────────────
Write-Host "[2/4] 檢查 Node.js..." -ForegroundColor Cyan
try {
    $nodever = node --version 2>&1
    Write-Host "  OK Node.js $nodever" -ForegroundColor Green
} catch {
    Write-Host "  ERROR 找不到 Node.js！請先安裝：https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# ── 後端 Python 套件 ─────────────────────────────────────────
Write-Host "" 
Write-Host "[3/4] 安裝後端 Python 套件..." -ForegroundColor Cyan
Set-Location backend

if (-Not (Test-Path ".venv")) {
    Write-Host "  建立虛擬環境 .venv ..." -ForegroundColor Gray
    py -m venv .venv
}

Write-Host "  升級 pip..." -ForegroundColor Gray
& ".venv\Scripts\pip.exe" install --upgrade pip -q

Write-Host "  安裝套件中，tensorflow 較大需要幾分鐘..." -ForegroundColor Gray
& ".venv\Scripts\pip.exe" install -r requirements.txt

Write-Host "  OK 後端套件安裝完成" -ForegroundColor Green
Set-Location ..

# ── 前端 Node 套件 ───────────────────────────────────────────
Write-Host ""
Write-Host "[4/4] 安裝前端 Node 套件..." -ForegroundColor Cyan
Set-Location frontend
npm install
Write-Host "  OK 前端套件安裝完成" -ForegroundColor Green
Set-Location ..

# ── 完成 ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  所有套件安裝完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "下一步請依序執行：" -ForegroundColor Yellow
Write-Host "  1. 填寫 backend\.kaggle\kaggle.json"
Write-Host "  2. cd backend"
Write-Host "  3. .venv\Scriptsctivate"
Write-Host "  4. python scrape_diseases.py"
Write-Host "  5. python download_dataset.py"
Write-Host "  6. python train_model.py"
Write-Host "  7. python app.py"
Write-Host "  8. 另開視窗 -> cd frontend -> npm run dev"
Write-Host ""
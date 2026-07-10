#!/usr/bin/env pwsh
param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$Root = Split-Path -Parent $PSCommandPath
$ErrorActionPreference = 'SilentlyContinue'

function Start-Backend {
    Write-Host "[1/3] Python API 后端 (端口 8000)..." -ForegroundColor Yellow
    $env:PYTHONPATH = "$Root\backend"
    $ps = Start-Process -PassThru -WindowStyle Hidden -FilePath 'python' -ArgumentList '-u', "$Root\backend\api_server.py"
    if ($ps.HasExited) {
        Write-Host "[错误] 后端启动失败" -ForegroundColor Red
        return $false
    }
    Write-Host "[OK] 后端已启动" -ForegroundColor Green
    Start-Sleep -Seconds 3
    return $true
}

function Start-Frontend {
    Write-Host "[2/3] 检查前端依赖..." -ForegroundColor Yellow
    if (-not (Test-Path "$Root\frontend\node_modules")) {
        Write-Host "[!] 安装前端依赖..." -ForegroundColor Yellow
        Push-Location "$Root\frontend"
        cmd /c "npm install --ignore-scripts"
        Pop-Location
    }
    Write-Host "[3/3] 前端服务器 (端口 8080)..." -ForegroundColor Yellow
    $cmd = 'set NODE_ENV=development && .\node_modules\.bin\vite --config vite.config.ts --host 0.0.0.0'
    $ps = Start-Process -PassThru -WindowStyle Hidden -FilePath 'cmd.exe' -ArgumentList '/c', $cmd
    Start-Sleep -Seconds 2
    return ($ps -and -not $ps.HasExited)
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  智扫通 - 智能客服系统" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not $FrontendOnly) { Start-Backend }
if (-not $BackendOnly)  { Start-Frontend }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 启动完成!" -ForegroundColor Green
Write-Host " 后端 API:   http://localhost:8000" -ForegroundColor White
Write-Host " 前端页面:   http://localhost:8080" -ForegroundColor White
Write-Host " API 文档:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键退出（服务继续在后台运行）" -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

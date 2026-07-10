@echo off
chcp 65001 >nul
title 智扫通启动器
cd /d "%~dp0"

echo ========================================
echo    智扫通 - 智能客服系统启动脚本
echo ========================================
echo.

REM ---- Check prerequisites ----
echo [1/4] 验证运行环境...
where python >nul 2>nul || (
    echo [错误] 未检测到 Python！请确认已安装并加入系统 PATH。
    pause & exit /b 1
)
python --version
where node >nul 2>nul || (
    echo [错误] 未检测到 Node.js！请确认已安装并加入系统 PATH。
    pause & exit /b 1
)
node --version
echo.

REM ---- Start Backend ----
echo [2/4] 启动 Python API 后端 (端口 8000)...
start "智扫通-后端" cmd /c "chcp 65001 >nul && title 智扫通-后端 && cd /d %~dp0backend && set PYTHONPATH=%~dp0backend && python api_server.py"
echo [OK] 后端启动中...
timeout /t 3 /nobreak >nul
echo.

REM ---- Check Frontend Deps ----
echo [3/4] 检查前端依赖...
if not exist "%~dp0frontend\node_modules" (
    echo [安装] 正在安装前端依赖，请稍候...
    cd /d "%~dp0frontend"
    call npm install --ignore-scripts
    if errorlevel 1 ( echo [错误] 安装失败！ & pause & exit /b 1 )
    cd /d "%~dp0"
    echo [OK] 安装完成
) else ( echo [OK] 前端依赖已安装 )
echo.

REM ---- Start Frontend ----
echo [4/4] 启动前端开发服务器 (端口 8080)...
start "智扫通-前端" cmd /c "chcp 65001 >nul && title 智扫通-前端 && cd /d %~dp0frontend && set NODE_ENV=development && npx vite --config vite.config.ts --host 0.0.0.0"

echo.
echo ========================================
echo         智扫通 - 启动完成！
echo ========================================
echo.
echo  前端页面:     http://localhost:8080
echo  后端 API:     http://localhost:8000
echo  API 文档:     http://localhost:8000/docs
echo.
echo  按任意键关闭此窗口（两个服务窗口请勿关闭）
echo ========================================
pause >nul

@echo off
echo 🚀 PureBite Windows Build Script
echo ================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Running as Administrator
) else (
    echo ⚠️  Not running as Administrator
    echo    Recommendation: Right-click and "Run as administrator" for best results
    echo.
)

:: Set build options
set /p BUILD_TYPE="Choose build type (1=Safe Build, 2=Force Rebuild, 3=Skip Prisma): "

if "%BUILD_TYPE%"=="1" (
    echo 🔧 Running safe build...
    call pnpm run build
) else if "%BUILD_TYPE%"=="2" (
    echo 🔧 Running force rebuild...
    call pnpm run build:force
) else if "%BUILD_TYPE%"=="3" (
    echo 🔧 Running build without Prisma generation...
    set SKIP_PRISMA_GENERATE=true
    call pnpm run build
) else (
    echo 🔧 Running default safe build...
    call pnpm run build
)

echo.
if %errorlevel% == 0 (
    echo ✅ Build completed successfully!
    echo.
    echo 📋 Available commands:
    echo    pnpm start    - Start production server
    echo    pnpm dev      - Start development server
    echo    pnpm build    - Build again
) else (
    echo ❌ Build failed!
    echo.
    echo 🔧 Troubleshooting options:
    echo    1. Run this script as Administrator
    echo    2. Close all editors and IDEs, then retry
    echo    3. Try: pnpm run fix:prisma
    echo    4. Restart computer and retry
)

echo.
pause
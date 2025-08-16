@echo off
echo Attempting to fix Prisma build issue...
cd /d "E:\1code\purebite"

echo Step 1: Killing any Node processes...
taskkill /f /im node.exe >nul 2>&1

echo Step 2: Removing problematic files...
rmdir /s /q "node_modules\.pnpm\@prisma+client@6.14.0_prism_9d44cd9e14cc8e39f902375d0254270e\node_modules\.prisma" >nul 2>&1

echo Step 3: Generating Prisma client...
pnpm exec prisma generate

echo Step 4: Building Next.js...
pnpm exec next build

echo Done!
pause
@echo off
taskkill /f /im git.exe /t 2>nul
taskkill /f /im less.exe /t 2>nul
timeout /t 2 /nobreak >nul
rmdir /s /q .git 2>nul
git init
git remote add origin https://github.com/AtharvaLotankar11/OfficePulse_Project.git
git add .
git commit -m "Initial commit - OfficePulse project"
git push -u origin main
pause
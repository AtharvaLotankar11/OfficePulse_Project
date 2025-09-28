@echo off
echo Killing any stuck git processes...
taskkill /f /im git.exe 2>nul
taskkill /f /im less.exe 2>nul
echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Removing old git repository...
if exist .git rmdir /s /q .git

echo Initializing new git repository...
git init

echo Adding remote origin...
git remote add origin https://github.com/AtharvaLotankar11/OfficePulse_Project.git

echo Adding all files...
git add .

echo Committing files...
git commit -m "Initial commit - OfficePulse project"

echo Pushing to GitHub...
git push -u origin main

echo Done!
pause
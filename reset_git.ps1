Stop-Process -Name "git" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "less" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
git init
git remote add origin https://github.com/AtharvaLotankar11/OfficePulse_Project.git
git add .
git commit -m "Initial commit - OfficePulse project"
git push -u origin main
# Script to restart TypeScript and clear VSCode cache
Write-Host "Restarting TypeScript Language Server..." -ForegroundColor Green

# Remove cache files
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Force tsconfig.tsbuildinfo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

Write-Host "Cache cleared. Please restart VSCode and run the TypeScript: Restart TS Server command (Ctrl+Shift+P)" -ForegroundColor Yellow
Write-Host "The website is ready at http://localhost:3000" -ForegroundColor Green
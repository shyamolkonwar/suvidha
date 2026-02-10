# SUVIDHA System Startup
# Checks for Docker and provides instructions

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  SUVIDHA System - Startup Check    " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is available
$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerAvailable) {
    Write-Host "✓ Docker detected!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting SUVIDHA with Docker Compose..." -ForegroundColor Cyan
    Write-Host ""
    
    # Start with Docker Compose
    docker compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ All services started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📱 Access URLs:" -ForegroundColor Cyan
        Write-Host "   Kiosk UI:         http://localhost:3000" -ForegroundColor White
        Write-Host "   Admin Dashboard:  http://localhost:3001" -ForegroundColor White
        Write-Host "   API Gateway:      http://localhost:8080" -ForegroundColor White
        Write-Host ""
        Write-Host "🔐 Test Credentials:" -ForegroundColor Cyan
        Write-Host "   Consumer ID: TEST001" -ForegroundColor White
        Write-Host "   Password:    Test@1234" -ForegroundColor White
        Write-Host ""
        Write-Host "📝 Useful commands:" -ForegroundColor Cyan
        Write-Host "   View logs: docker compose logs -f" -ForegroundColor Yellow
        Write-Host "   Stop all:  docker compose down" -ForegroundColor Yellow
        Write-Host ""
    }
}
else {
    Write-Host "⚠ Docker is NOT installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run SUVIDHA, please install Docker Desktop:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor Blue
    Write-Host ""
    Write-Host "After installing Docker:" -ForegroundColor Cyan
    Write-Host "  1. Start Docker Desktop" -ForegroundColor White
    Write-Host "  2. Run this script again: .\start-system.ps1" -ForegroundColor White
    Write-Host ""
}

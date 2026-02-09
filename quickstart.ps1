#!/usr/bin/env pwsh
# Quick Start Script for SUVIDHA Kiosk System

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  SUVIDHA Digital Receptionist Kiosk System Setup  " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check Docker
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "✓ Docker installed" -ForegroundColor Green
} else {
    Write-Host "✗ Docker not found. Please install Docker Desktop" -ForegroundColor Red
    exit 1
}

# Check Docker Compose
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    Write-Host "✓ Docker Compose installed" -ForegroundColor Green
} else {
    Write-Host "✗ Docker Compose not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Create .env file
Write-Host "[2/6] Setting up environment variables..." -ForegroundColor Yellow

if (-Not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file from template" -ForegroundColor Green
    Write-Host "⚠ IMPORTANT: Update .env with your configuration!" -ForegroundColor Magenta
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

Write-Host ""

# Install root dependencies
Write-Host "[3/6] Installing root dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✓ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Install auth service dependencies
Write-Host "[4/6] Installing service dependencies..." -ForegroundColor Yellow
Set-Location services/auth-service
npm install
Set-Location ../..
Write-Host "✓ Auth service dependencies installed" -ForegroundColor Green
Write-Host ""

# Start Docker containers
Write-Host "[5/6] Starting Docker containers..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first run..." -ForegroundColor Gray

docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker containers started successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start Docker containers" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Wait for databases to be ready
Write-Host "[6/6] Waiting for databases to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
docker-compose exec -T auth-service npm run migrate

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  ✓ Setup Complete!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services are now running:" -ForegroundColor White
Write-Host "  • API Gateway:     http://localhost:8000" -ForegroundColor Cyan
Write-Host "  • Auth Service:    http://localhost:8001" -ForegroundColor Cyan
Write-Host "  • Utility Service: http://localhost:8002" -ForegroundColor Cyan
Write-Host "  • Payment Service: http://localhost:8003" -ForegroundColor Cyan
Write-Host "  • Kiosk UI:        http://localhost:3000" -ForegroundColor Cyan
Write-Host "  • Admin Dashboard: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor White
Write-Host "  • View logs:       docker-compose logs -f" -ForegroundColor Gray
Write-Host "  • Stop services:   docker-compose down" -ForegroundColor Gray
Write-Host "  • Restart:         docker-compose restart" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test the auth service: http://localhost:8000/api/auth/health" -ForegroundColor Gray
Write-Host "  2. Review API documentation in ./docs/" -ForegroundColor Gray
Write-Host "  3. Start developing!" -ForegroundColor Gray
Write-Host ""

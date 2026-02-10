# Install all backend service dependencies
# Run this script to fix TypeScript IDE errors

Write-Host "Installing dependencies for all backend services..." -ForegroundColor Green

$services = @(
    "services/auth-service",
    "services/utility-service",
    "services/payment-service",
    "services/grievance-service",
    "services/monitor-service",
    "services/cms-service",
    "services/analytics-service"
)

foreach ($service in $services) {
    Write-Host "`nInstalling dependencies for $service..." -ForegroundColor Cyan
    
    if (Test-Path $service) {
        Push-Location $service
        
        if (Test-Path "package.json") {
            npm install
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Successfully installed dependencies for $service" -ForegroundColor Green
            }
            else {
                Write-Host "✗ Failed to install dependencies for $service" -ForegroundColor Red
            }
        }
        else {
            Write-Host "⚠ No package.json found in $service" -ForegroundColor Yellow
        }
        
        Pop-Location
    }
    else {
        Write-Host "⚠ Directory $service not found" -ForegroundColor Yellow
    }
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "Installing frontend dependencies..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

$frontends = @(
    "frontend/kiosk-ui",
    "frontend/admin-dashboard"
)

foreach ($frontend in $frontends) {
    Write-Host "`nInstalling dependencies for $frontend..." -ForegroundColor Cyan
    
    if (Test-Path $frontend) {
        Push-Location $frontend
        
        if (Test-Path "package.json") {
            npm install
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Successfully installed dependencies for $frontend" -ForegroundColor Green
            }
            else {
                Write-Host "✗ Failed to install dependencies for $frontend" -ForegroundColor Red
            }
        }
        else {
            Write-Host "⚠ No package.json found in $frontend" -ForegroundColor Yellow
        }
        
        Pop-Location
    }
    else {
        Write-Host "⚠ Directory $frontend not found" -ForegroundColor Yellow
    }
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "`nReload your VS Code window to clear TypeScript errors:" -ForegroundColor Yellow
Write-Host "  Press Ctrl+Shift+P" -ForegroundColor Cyan
Write-Host "  Type: 'Developer: Reload Window'" -ForegroundColor Cyan
Write-Host "  Press Enter" -ForegroundColor Cyan

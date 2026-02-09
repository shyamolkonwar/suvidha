# Start all SUVIDHA services automatically (without Docker)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Starting SUVIDHA Services...      " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is accessible
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgCheck = psql -U postgres -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ PostgreSQL not accessible!" -ForegroundColor Red
    Write-Host "Please make sure PostgreSQL is installed and running." -ForegroundColor Yellow
    Write-Host "See MANUAL_SETUP.md for installation instructions." -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
Write-Host ""

Write-Host "Starting all services in separate windows..." -ForegroundColor Cyan
Write-Host ""

# Start backend services
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\auth-service'; Write-Host 'Auth Service (Port 8001)' -ForegroundColor Cyan; npm run dev"
Write-Host "✓ Started Auth Service" -ForegroundColor Green
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\utility-service'; Write-Host 'Utility Service (Port 8002)' -ForegroundColor Cyan; npm run dev"
Write-Host "✓ Started Utility Service" -ForegroundColor Green
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\payment-service'; Write-Host 'Payment Service (Port 8003)' -ForegroundColor Cyan; npm run dev"
Write-Host "✓ Started Payment Service" -ForegroundColor Green
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\grievance-service'; Write-Host 'Grievance Service (Port 8004)' -ForegroundColor Cyan; npm run dev"
Write-Host "✓ Started Grievance Service" -ForegroundColor Green
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\monitor-service'; Write-Host 'Monitor Service (Port 8005)' -ForegroundColor Cyan; npm run dev"
Write-Host "✓ Started Monitor Service" -ForegroundColor Green
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\cms-service'; Write-Host 'CMS Service (Port 8006)' -ForegroundColor Cyan; npm run dev"
Write-Host "✓ Started CMS Service" -ForegroundColor Green
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\analytics-service'; Write-Host 'Analytics Service (Port 8007)' -ForegroundColor Cyan; npm run dev"
Write-Host "✓ Started Analytics Service" -ForegroundColor Green
Start-Sleep -Seconds 2

# Start frontends
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\frontend\kiosk-ui'; Write-Host 'Kiosk UI' -ForegroundColor Cyan; npm run dev"
Write-Host "✓ Started Kiosk UI" -ForegroundColor Green
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\frontend\admin-dashboard'; Write-Host 'Admin Dashboard' -ForegroundColor Cyan; npm run dev"
Write-Host "✓ Started Admin Dashboard" -ForegroundColor Green

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  All services starting...          " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please wait 30 seconds for everything to initialize..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Then access:" -ForegroundColor Cyan
Write-Host "  Kiosk UI:         http://localhost:5173" -ForegroundColor White
Write-Host "  Admin Dashboard:  http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "Login: TEST001 / Test@1234" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop: Close all the terminal windows that opened" -ForegroundColor Yellow

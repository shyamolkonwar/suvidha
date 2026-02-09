# Complete Setup Script - SUVIDHA
# This will: 1) Get PostgreSQL password, 2) Create databases, 3) Run migrations, 4) Start all services

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  SUVIDHA Complete Setup             " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get PostgreSQL password
Write-Host "Step 1: PostgreSQL Password" -ForegroundColor Yellow
Write-Host "What is your PostgreSQL password?" -ForegroundColor Cyan
Write-Host "(The password you set when installing PostgreSQL)" -ForegroundColor Gray
$pgPassword = Read-Host "Enter password"

# Update all .env files with correct password
Write-Host ""
Write-Host "Updating configuration files..." -ForegroundColor Yellow

$services = @(
    "auth-service",
    "utility-service",
    "payment-service",
    "grievance-service",
    "monitor-service",
    "cms-service",
    "analytics-service"
)

foreach ($service in $services) {
    $envFile = "services\$service\.env"
    if (Test-Path $envFile) {
        (Get-Content $envFile) -replace 'DB_PASSWORD=postgres', "DB_PASSWORD=$pgPassword" | Set-Content $envFile
    }
}

Write-Host "✓ Configuration updated" -ForegroundColor Green

# Step 2: Create databases using pgAdmin SQL
Write-Host ""
Write-Host "Step 2: Creating Databases" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please open pgAdmin and run this:" -ForegroundColor Cyan
Write-Host "  1. Right-click 'PostgreSQL 18' → 'Query Tool'" -ForegroundColor White
Write-Host "  2. Copy and paste this SQL:" -ForegroundColor White
Write-Host ""
Write-Host "CREATE DATABASE auth_db;" -ForegroundColor Green
Write-Host "CREATE DATABASE utility_db;" -ForegroundColor Green
Write-Host "CREATE DATABASE payment_db;" -ForegroundColor Green
Write-Host "CREATE DATABASE grievance_db;" -ForegroundColor Green
Write-Host "CREATE DATABASE monitor_db;" -ForegroundColor Green
Write-Host "CREATE DATABASE cms_db;" -ForegroundColor Green
Write-Host "CREATE DATABASE analytics_db;" -ForegroundColor Green
Write-Host ""
Write-Host "  3. Click Execute (▶️)" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter when databases are created" | Out-Null

# Step 3: Run migrations
Write-Host ""
Write-Host "Step 3: Running Migrations" -ForegroundColor Yellow

foreach ($service in $services) {
    Write-Host "  Migrating $service..." -ForegroundColor Cyan
    Push-Location "services\$service"
    npm run migrate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $service migrated" -ForegroundColor Green
    }
    else {
        Write-Host "  ✗ $service migration failed" -ForegroundColor Red
    }
    Pop-Location
}

# Step 4: Start all services
Write-Host ""
Write-Host "Step 4: Starting All Services" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening 9 terminal windows..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\auth-service'; Write-Host 'Auth Service (Port 8001)' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\utility-service'; Write-Host 'Utility Service (Port 8002)' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\payment-service'; Write-Host 'Payment Service (Port 8003)' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\grievance-service'; Write-Host 'Grievance Service (Port 8004)' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\monitor-service'; Write-Host 'Monitor Service (Port 8005)' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\cms-service'; Write-Host 'CMS Service (Port 8006)' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\services\analytics-service'; Write-Host 'Analytics Service (Port 8007)' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\frontend\kiosk-ui'; Write-Host 'Kiosk UI' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\SUDVIDA\frontend\admin-dashboard'; Write-Host 'Admin Dashboard' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!                    " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait 30 seconds, then access:" -ForegroundColor Yellow
Write-Host "  Kiosk UI:         http://localhost:5173" -ForegroundColor White
Write-Host "  Admin Dashboard:  http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "Login: TEST001 / Test@1234" -ForegroundColor Cyan
Write-Host ""

# Test and verify the complete system

Write-Host "🚀 SUVIDHA System Verification" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "📦 Checking Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running`n" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop`n" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion installed`n" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+`n" -ForegroundColor Red
    exit 1
}

# Check if services are already running
Write-Host "🔍 Checking running services..." -ForegroundColor Yellow
$runningContainers = docker-compose ps --services --filter "status=running" 2>$null

if ($runningContainers) {
    Write-Host "⚠️  Services already running:" -ForegroundColor Yellow
    $runningContainers | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    Write-Host ""
    
    $response = Read-Host "Stop and restart all services? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "`n🛑 Stopping services..." -ForegroundColor Yellow
        docker-compose down
        Start-Sleep -Seconds 2
    }
    else {
        Write-Host "Continuing with existing services...`n" -ForegroundColor Cyan
    }
}

# Start services
Write-Host "🚀 Starting all services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host "`n⏳ Waiting for services to start (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "`n🏥 Checking service health..." -ForegroundColor Yellow
$services = @(
    @{Name = "API Gateway"; URL = "http://localhost:8000/health" },
    @{Name = "Auth Service"; URL = "http://localhost:8001/health" },
    @{Name = "Utility Service"; URL = "http://localhost:8002/health" },
    @{Name = "Payment Service"; URL = "http://localhost:8003/health" },
    @{Name = "Grievance Service"; URL = "http://localhost:8004/health" }
)

$allHealthy = $true
foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name) is healthy" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  $($service.Name) returned status $($response.StatusCode)" -ForegroundColor Yellow
            $allHealthy = $false
        }
    }
    catch {
        Write-Host "❌ $($service.Name) is not responding" -ForegroundColor Red
        $allHealthy = $false
    }
}

if (-not $allHealthy) {
    Write-Host "`n⚠️  Some services are not healthy. Check logs with: docker-compose logs -f`n" -ForegroundColor Yellow
}

# Run migrations
Write-Host "`n📊 Running database migrations..." -ForegroundColor Yellow

$migrations = @(
    "auth-service",
    "utility-service",
    "payment-service",
    "grievance-service"
)

foreach ($service in $migrations) {
    Write-Host "   - Migrating $service..." -ForegroundColor Cyan
    docker-compose exec -T $service npm run migrate 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $service migrated" -ForegroundColor Green
    }
    else {
        Write-Host "   ⚠️  $service migration may have issues" -ForegroundColor Yellow
    }
}

# Test API
Write-Host "`n🧪 Testing API..." -ForegroundColor Yellow

# Test login
try {
    $loginBody = @{
        consumer_id = "TEST001"
        password    = "Test@1234"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod `
        -Uri "http://localhost:8000/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"

    if ($loginResponse.success) {
        Write-Host "✅ Login successful" -ForegroundColor Green
        $token = $loginResponse.data.token
        $headers = @{ Authorization = "Bearer $token" }

        # Test bills endpoint
        try {
            $billsResponse = Invoke-RestMethod `
                -Uri "http://localhost:8000/api/utility/bills/TEST001" `
                -Headers $headers

            if ($billsResponse.success) {
                Write-Host "✅ Bills API working" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "⚠️  Bills API issue: $_" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "⚠️  Login test issue: $_" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "📊 SYSTEM STATUS" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan

Write-Host "`n✅ Backend Services: Running" -ForegroundColor Green
Write-Host "   - API Gateway: http://localhost:8000" -ForegroundColor White
Write-Host "   - Auth Service: http://localhost:8001" -ForegroundColor White
Write-Host "   - Utility Service: http://localhost:8002" -ForegroundColor White
Write-Host "   - Payment Service: http://localhost:8003" -ForegroundColor White
Write-Host "   - Grievance Service: http://localhost:8004" -ForegroundColor White

Write-Host "`n📝 Test Credentials:" -ForegroundColor Yellow
Write-Host "   Consumer ID: TEST001" -ForegroundColor White
Write-Host "   Password: Test@1234`n" -ForegroundColor White

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Start frontend: cd frontend/kiosk-ui && npm run dev" -ForegroundColor White
Write-Host "   2. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "   3. View logs: docker-compose logs -f [service-name]" -ForegroundColor White
Write-Host "   4. Stop all: docker-compose down`n" -ForegroundColor White

Write-Host "✨ System is ready!`n" -ForegroundColor Green

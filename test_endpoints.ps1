# Test: Get user orders
Write-Host "Testing GET /api/orders/user/7..."
(Invoke-WebRequest -Uri "http://localhost:3000/api/orders/user/7" -UseBasicParsing).Content | ConvertFrom-Json | Select-Object -First 1

# Test: Get specific order
Write-Host "
Testing GET /api/orders/37..."
(Invoke-WebRequest -Uri "http://localhost:3000/api/orders/37" -UseBasicParsing).Content | ConvertFrom-Json

# Test: Update order status
Write-Host "
Testing PUT /api/orders/37/status..."
(Invoke-WebRequest -Uri "http://localhost:3000/api/orders/37/status" -Method PUT -ContentType application/json -Body '{\"status\":\"shipped\"}' -UseBasicParsing).Content | ConvertFrom-Json

# Test: Search products
Write-Host "
Testing search..."
(Invoke-WebRequest -Uri "http://localhost:3000/api/products" -UseBasicParsing).Content | ConvertFrom-Json | Where-Object {.name -like "*Spider*"}

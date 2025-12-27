# Check what the API actually returns

$API_URL = "https://api.koinoniasms.com"
$GROUP_ID = "cmjnzo0wq0009o29s6zrc3wt8"

# Login
$loginBody = @{
    email = "DOKaA@GMAIL.COM"
    password = "12!Michael"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$API_URL/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$loginData = $loginResponse.Content | ConvertFrom-Json
$TOKEN = $loginData.data.accessToken

# Get members with default parameters (what frontend would get on first load)
Write-Host "Getting members with default pagination (page=1, limit=50)..."
$response1 = Invoke-WebRequest -Uri "$API_URL/api/groups/$GROUP_ID/members" `
    -Headers @{"Authorization" = "Bearer $TOKEN"}

$data1 = $response1.Content | ConvertFrom-Json

Write-Host ""
Write-Host "API Response 1 (default):"
Write-Host "  Status: $($response1.StatusCode)"
Write-Host "  Data count: $($data1.data.Count)"
Write-Host "  Pagination total: $($data1.pagination.total)"
Write-Host "  Pagination page: $($data1.pagination.page)"
Write-Host "  Pagination limit: $($data1.pagination.limit)"
Write-Host "  First 3 members:"
$data1.data | Select-Object -First 3 | ForEach-Object {
    Write-Host "    - $($_.firstName) $($_.lastName) (ID: $($_.id))"
}

# Get members with explicit parameters
Write-Host ""
Write-Host "Getting members with explicit page=1&limit=50..."
$response2 = Invoke-WebRequest -Uri "$API_URL/api/groups/$GROUP_ID/members?page=1&limit=50" `
    -Headers @{"Authorization" = "Bearer $TOKEN"}

$data2 = $response2.Content | ConvertFrom-Json

Write-Host ""
Write-Host "API Response 2 (explicit page=1&limit=50):"
Write-Host "  Data count: $($data2.data.Count)"
Write-Host "  Pagination total: $($data2.pagination.total)"

# Get with limit=100
Write-Host ""
Write-Host "Getting members with limit=100..."
$response3 = Invoke-WebRequest -Uri "$API_URL/api/groups/$GROUP_ID/members?page=1&limit=100" `
    -Headers @{"Authorization" = "Bearer $TOKEN"}

$data3 = $response3.Content | ConvertFrom-Json

Write-Host ""
Write-Host "API Response 3 (limit=100):"
Write-Host "  Data count: $($data3.data.Count)"
Write-Host "  Pagination total: $($data3.pagination.total)"

Write-Host ""
Write-Host "════════════════════════════════════════"
Write-Host "SUMMARY:"
Write-Host "  Default call returns: $($data1.data.Count) members (total: $($data1.pagination.total))"
Write-Host "  Page 1 (50 per page): $($data2.data.Count) members (total: $($data2.pagination.total))"
Write-Host "  Page 1 (100 per page): $($data3.data.Count) members (total: $($data3.pagination.total))"
Write-Host "════════════════════════════════════════"

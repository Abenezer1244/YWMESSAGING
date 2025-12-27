# Direct API test to see exact response

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

Write-Host "Making API call to: $API_URL/api/groups/$GROUP_ID/members"
Write-Host "Authorization: Bearer [token]"
Write-Host ""

# Make the call
$response = Invoke-WebRequest -Uri "$API_URL/api/groups/$GROUP_ID/members" `
    -Headers @{"Authorization" = "Bearer $TOKEN"} `
    -UseBasicParsing

# Print raw JSON
Write-Host "Raw JSON Response:"
Write-Host "==================="
Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

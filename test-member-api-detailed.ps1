# Test member creation and list API with detailed output

$GROUP_ID = "cmjnzo0wq0009o29s6zrc3wt8"
$API_URL = "https://api.koinoniasms.com"

# Login to get token
Write-Host "Logging in..."
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

Write-Host "OK - Logged in"
Write-Host ""

# Get initial member list
Write-Host "Getting initial member list..."
$initialListResponse = Invoke-WebRequest -Uri "$API_URL/api/groups/$GROUP_ID/members?limit=100" `
    -Headers @{"Authorization" = "Bearer $TOKEN"}

$initialListData = $initialListResponse.Content | ConvertFrom-Json
Write-Host "Initial member count: $($initialListData.data.Count)"
Write-Host "First 3 members:"
$initialListData.data | Select-Object -First 3 | ForEach-Object {
    Write-Host "  - $($_.firstName) $($_.lastName) (ID: $($_.id))"
}
Write-Host ""

# Create a new member
Write-Host "Creating new member..."
$timestamp = [int64](Get-Date -UFormat %s)
$memberBody = @{
    firstName = "TestMember"
    lastName = "APITest$timestamp"
    phone = "+15556347283"
    optInSms = $true
} | ConvertTo-Json

$memberResponse = Invoke-WebRequest -Uri "$API_URL/api/groups/$GROUP_ID/members" `
    -Method POST `
    -Headers @{"Authorization" = "Bearer $TOKEN"} `
    -ContentType "application/json" `
    -Body $memberBody

$memberData = $memberResponse.Content | ConvertFrom-Json
$NEW_MEMBER_ID = $memberData.data.id

Write-Host "OK - Member created with ID: $NEW_MEMBER_ID"
Write-Host "       Name: $($memberData.data.firstName) $($memberData.data.lastName)"
Write-Host ""

# Immediate check
Write-Host "Checking member list immediately after creation..."
$immediateListResponse = Invoke-WebRequest -Uri "$API_URL/api/groups/$GROUP_ID/members?limit=100" `
    -Headers @{"Authorization" = "Bearer $TOKEN"}

$immediateListData = $immediateListResponse.Content | ConvertFrom-Json
Write-Host "Member count: $($immediateListData.data.Count)"

$newMemberInList = $immediateListData.data | Where-Object { $_.id -eq $NEW_MEMBER_ID }
Write-Host "New member found: $(if ($newMemberInList) { 'YES - ' + $newMemberInList.firstName + ' ' + $newMemberInList.lastName } else { 'NO' })"

Write-Host ""
Write-Host "First 3 members in list:"
$immediateListData.data | Select-Object -First 3 | ForEach-Object {
    Write-Host "  - $($_.firstName) $($_.lastName) (ID: $($_.id))$(if ($_.id -eq $NEW_MEMBER_ID) { ' <-- NEW MEMBER' })"
}

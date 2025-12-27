# Test member creation and list API
# Using a known group ID from our logs: cmjnzo0wq0009o29s6zrc3wt8

$GROUP_ID = "cmjnzo0wq0009o29s6zrc3wt8"
$API_URL = "https://api.koinoniasms.com"

Write-Host "========================================================"
Write-Host "Test: Member API (Add + List Check)"
Write-Host "========================================================"
Write-Host ""

# Login to get token
Write-Host "LOGIN - Authenticating..."
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

if (-not $TOKEN) {
    Write-Host "FAILED to get authentication token"
    Write-Host "Response: $($loginResponse.Content)"
    exit 1
}

Write-Host "OK - Logged in"
Write-Host ""

# Get initial member count
Write-Host "Getting initial member count for group: $GROUP_ID"
$initialListResponse = Invoke-WebRequest -Uri "$API_URL/api/groups/$GROUP_ID/members?limit=100" `
    -Headers @{"Authorization" = "Bearer $TOKEN"}

$initialListData = $initialListResponse.Content | ConvertFrom-Json
$INITIAL_COUNT = $initialListData.data.Count

Write-Host "Initial members: $INITIAL_COUNT"
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

if (-not $NEW_MEMBER_ID) {
    Write-Host "FAILED to create member"
    Write-Host "Response: $($memberResponse.Content)"
    exit 1
}

Write-Host "OK - Member created with ID: $NEW_MEMBER_ID"
Write-Host ""

# Immediate check
Write-Host "Checking member list immediately after creation..."
$immediateListResponse = Invoke-WebRequest -Uri "$API_URL/api/groups/$GROUP_ID/members?limit=100" `
    -Headers @{"Authorization" = "Bearer $TOKEN"}

$immediateListData = $immediateListResponse.Content | ConvertFrom-Json
$IMMEDIATE_COUNT = $immediateListData.data.Count
$MEMBER_IN_LIST = $immediateListData.data | Where-Object { $_.id -eq $NEW_MEMBER_ID }

Write-Host "Members after creation: $IMMEDIATE_COUNT"
Write-Host "New member in list: $(if ($MEMBER_IN_LIST) { 'YES' } else { 'NO' })"
Write-Host ""

# Wait and check again
Write-Host "Waiting 3 seconds and checking again..."
Start-Sleep -Seconds 3

$delayedListResponse = Invoke-WebRequest -Uri "$API_URL/api/groups/$GROUP_ID/members?limit=100" `
    -Headers @{"Authorization" = "Bearer $TOKEN"}

$delayedListData = $delayedListResponse.Content | ConvertFrom-Json
$DELAYED_COUNT = $delayedListData.data.Count
$MEMBER_IN_DELAYED = $delayedListData.data | Where-Object { $_.id -eq $NEW_MEMBER_ID }

Write-Host "Members after delay: $DELAYED_COUNT"
Write-Host "New member in list: $(if ($MEMBER_IN_DELAYED) { 'YES' } else { 'NO' })"

Write-Host ""
Write-Host "========================================================"
Write-Host "SUMMARY:"
Write-Host "  Initial: $INITIAL_COUNT members"
Write-Host "  After creation: $IMMEDIATE_COUNT members"
Write-Host "  After 3s delay: $DELAYED_COUNT members"
Write-Host "  New member found: $(if ($MEMBER_IN_LIST) { 'YES' } else { 'NO' })"
Write-Host "========================================================"

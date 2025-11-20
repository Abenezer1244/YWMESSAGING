# Telnyx Dashboard Setup - Step by Step Guide

**Date:** November 19, 2025
**Objective:** Configure 10DLC webhook in Telnyx Dashboard
**Time Required:** 5-10 minutes

---

## ✅ Step 1: Log Into Telnyx Portal

1. Go to: **https://portal.telnyx.com**
2. Enter your email and password
3. Click **Sign In**
4. You should see the Telnyx Dashboard home page

---

## ✅ Step 2: Navigate to Webhooks Settings

### Location 1: Via Settings Menu
1. Look for **Settings** in the left sidebar or top menu
2. Look for **Webhooks**, **API Webhooks**, or **Messaging Webhooks**

### Location 2: Via Messaging Menu
1. Click **Messaging** in left sidebar
2. Look for **Settings** or **Webhooks**

### Location 3: Direct URL (try this first)
- Try navigating to: `https://portal.telnyx.com/webhooks`
- Or: `https://portal.telnyx.com/settings/webhooks`

**You should see:**
- A list of existing webhooks (possibly your MMS webhook)
- A button that says "**Create Webhook**" or "**Add Webhook**"
- Possibly separate sections for different webhook types

---

## ✅ Step 3: Create a New 10DLC Webhook

Click the button to create/add a new webhook.

**Look for a form with these fields:**
- Webhook URL / Endpoint URL
- Webhook Type / Category
- Event Types
- Authentication / Signature Settings

---

## ✅ Step 4: Enter Webhook URLs

### Primary URL Field
**Paste this exactly:**
```
https://api.koinoniasms.com/api/webhooks/10dlc/status
```

### Failover URL Field (if available)
**Paste this exactly:**
```
https://api.koinoniasms.com/api/webhooks/10dlc/status-failover
```

**If you don't see a failover field:**
- That's OK, some interfaces only show one URL
- You can add failover as a separate webhook later
- For now, just use the primary URL

---

## ✅ Step 5: Select Event Types

Look for a section called **Event Types**, **Events**, or **Webhook Events**.

**Check these boxes:**
- [ ] **Brand Status Updated** (brand.vetting_update or similar)
- [ ] **Brand Vetting Update**
- [ ] **Campaign Status Changed** (campaign.status_changed or similar)
- [ ] **Phone Number Assigned** (phone_number.assignment or similar)
- [ ] **10DLC Status** (if available as a category)

**Don't uncheck:**
- Keep any existing event types that are already checked
- If you're unsure, check all 10DLC-related events

**If you see a dropdown menu:**
- Select: **10DLC**, **Messaging**, or **Brand Management**

---

## ✅ Step 6: Configure Signature Verification

Look for a section called:
- **Signature Verification**
- **Authentication**
- **Security**
- **Signing Method**

### Set Algorithm to ED25519

**Look for a dropdown that says:**
- Signature Algorithm
- Signing Algorithm
- Verification Method

**Select:** `ED25519` (NOT HMAC, NOT SHA256)

---

## ✅ Step 7: Enter the Public Key

Find the field for:
- **Public Key**
- **Ed25519 Public Key**
- **Signing Key**

**Paste this EXACTLY:**
```
ed+eUTZxpqkpY6ySkZYKcvhMuCkWgYQniDA8QMVD0UM=
```

**Make sure:**
- [ ] The key is exactly as shown (copy/paste, don't retype)
- [ ] No extra spaces before or after
- [ ] It starts with `ed+` and ends with `UM=`

---

## ✅ Step 8: Save the Webhook

Look for a button that says:
- **Save**
- **Create Webhook**
- **Add Webhook**
- **Save Settings**

Click it. You should see a confirmation message like:
- ✅ "Webhook created successfully"
- ✅ "Webhook saved"
- ✅ "Changes saved"

---

## ✅ Step 9: Test the Webhook

### Option 1: Test Button in Telnyx (Recommended)
1. Find your newly created webhook in the list
2. Look for a **Test** button or **Send Test Event** link
3. Click it
4. **Expected response:** `202 Accepted` or success message

### Option 2: Manual Test (if no test button)
Open a terminal and run:
```bash
curl -i https://api.koinoniasms.com/api/webhooks/10dlc/status
```

You should see:
```
HTTP/1.1 200 OK
{"status":"ok","message":"Telnyx 10DLC webhook endpoint is healthy","timestamp":"..."}
```

---

## ⚠️ Troubleshooting

### Issue: Can't find Webhooks section
**Solution:**
1. Check if you're in the right account/organization
2. Try searching for "webhook" in the Telnyx portal search bar
3. Check if you have API access permissions
4. Try: `https://portal.telnyx.com/webhooks`

### Issue: ED25519 option not available
**Solution:**
1. Look for "Public Key" method instead of algorithm selector
2. Check if there's a different signing method section
3. Contact Telnyx support: support@telnyx.com

### Issue: Public key field not accepting the key
**Solution:**
1. Make sure you're copying the ENTIRE key: `ed+eUTZxpqkpY6ySkZYKcvhMuCkWgYQniDA8QMVD0UM=`
2. Don't include quotes or extra spaces
3. Try clearing the field and pasting again
4. If still failing, contact Telnyx support

### Issue: Test webhook returns error
**Solution:**
1. If you get "Invalid signature" - this is OK! It means verification is working
2. If you get "Not Found" - check the URL spelling (should be `api.koinoniasms.com`, not `connect-yw-backend`)
3. If you get a timeout - check that the domain is accessible

---

## ✅ What Success Looks Like

After configuration, you should see in Telnyx:

```
Webhook URL:       https://api.koinoniasms.com/api/webhooks/10dlc/status
Failover URL:      https://api.koinoniasms.com/api/webhooks/10dlc/status-failover
Event Types:       Brand Status, Campaign Status, Phone Assignment
Signature Method:  ED25519
Public Key:        ed+eUTZxpqkpY6ySkZYKcvhMuCkWgYQniDA8QMVD0UM=
Status:            ✅ Active
```

---

## ✅ Final Verification

After saving:

1. **Log into your Koinonia SMS app**
2. **Go to Settings page**
3. **The 10DLC form should appear** with fields for:
   - EIN
   - Phone number
   - Address
   - Website
   - Entity type
   - Vertical

4. **Fill out the form** (use your church's information)
5. **Click Save Changes**
6. **Data should persist** when you refresh the page

---

## 📋 Checklist

- [ ] Logged into Telnyx Portal (portal.telnyx.com)
- [ ] Found Webhooks Settings
- [ ] Created new webhook for 10DLC
- [ ] Entered primary URL: `https://api.koinoniasms.com/api/webhooks/10dlc/status`
- [ ] Entered failover URL: `https://api.koinoniasms.com/api/webhooks/10dlc/status-failover`
- [ ] Selected event types (brand, campaign, phone assignment)
- [ ] Set signature algorithm to ED25519
- [ ] Pasted public key: `ed+eUTZxpqkpY6ySkZYKcvhMuCkWgYQniDA8QMVD0UM=`
- [ ] Clicked Save/Create
- [ ] Tested the webhook
- [ ] Received success response

---

## 🎯 Next After This

Once webhooks are configured in Telnyx:

1. **Churches fill in 10DLC form** in Settings
2. **System auto-registers brand** with Telnyx
3. **Telnyx sends status updates** to your webhooks
4. **Your system processes updates** and shows status to church

---

**Need help?** Let me know what screen you're seeing and I'll help you navigate!

Generated: November 19, 2025

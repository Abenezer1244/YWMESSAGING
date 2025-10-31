# Stripe Payment Flow Testing Guide

## Prerequisites

### 1. Environment Setup

Ensure your `.env.local` file has:
```env
# Stripe Test Keys (get from: https://dashboard.stripe.com/test/apikeys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Other required variables
VITE_API_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Backend Stripe Setup

Ensure your backend has:
```typescript
// Example: backend payment intent creation
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Create payment intent endpoint
app.post('/api/billing/payment-intent', async (req, res) => {
  try {
    const { planName } = req.body;

    const planPrices: Record<string, number> = {
      starter: 4900,    // $49.00
      growth: 7900,     // $79.00
      pro: 9900,        // $99.00
    };

    const amount = planPrices[planName];
    if (!amount) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        planName,
        churchId: req.user?.churchId,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Payment intent creation failed' });
  }
});
```

---

## Testing Scenarios

### ✅ Test Case 1: Successful Payment

**Test Card:** `4242 4242 4242 4242`
**Expiry:** Any future date (e.g., 12/25)
**CVV:** Any 3 digits (e.g., 123)

**Steps:**
1. Navigate to /subscribe
2. Click "Get Started" on any plan
3. You should redirect to /checkout?plan=growth
4. Enter cardholder name: "Test User"
5. Enter card details using test card above
6. Check "I agree to Terms of Service and Privacy Policy"
7. Click "Pay $X"

**Expected Result:**
- ✅ Card accepted
- ✅ Toast shows "Payment successful!"
- ✅ Redirects to /billing
- ✅ Subscription status updated in backend

**Browser Console Check:**
- ❌ Should NOT see: "4242 4242 4242 4242" (card number)
- ❌ Should NOT see: CVV or expiry date
- ✅ Should see: "Stripe error: ..." only if error occurs (dev-only)

---

### ❌ Test Case 2: Card Declined (Insufficient Funds)

**Test Card:** `4000 0000 0000 0002`
**Expiry:** Any future date
**CVV:** Any 3 digits

**Steps:**
1. Repeat Test Case 1 with card `4000 0000 0000 0002`

**Expected Result:**
- ✅ Payment rejected
- ✅ Error message: "Payment failed. Please verify your card details and try again."
- ✅ Stays on /checkout page
- ❌ Does NOT expose Stripe error code to user

---

### ❌ Test Case 3: Invalid Card Number

**Test Input:** `1234 5678 9012 3456`
**Expiry:** Any future date
**CVV:** Any 3 digits

**Steps:**
1. Repeat Test Case 1 with invalid card number

**Expected Result:**
- ✅ Card element shows error (red border)
- ✅ Submit button disabled
- ✅ Cannot submit form with invalid card

---

### ❌ Test Case 4: Missing Cardholder Name

**Test Card:** `4242 4242 4242 4242`
**Cardholder Name:** (leave empty)

**Steps:**
1. Repeat Test Case 1 but leave cardholder name blank
2. Try to click "Pay"

**Expected Result:**
- ✅ Error toast: "Cardholder name is required"
- ✅ Does NOT submit payment

---

### ❌ Test Case 5: Terms Agreement Required

**Test Card:** `4242 4242 4242 4242`
**Terms Checkbox:** Unchecked

**Steps:**
1. Repeat Test Case 1 but uncheck terms checkbox
2. Try to click "Pay"

**Expected Result:**
- ✅ Form validation prevents submission
- ✅ Cannot pay without agreeing to terms

---

### 🔐 Test Case 6: Security - No Card Data in Console

**Steps:**
1. Navigate to /checkout?plan=starter
2. Open DevTools (F12)
3. Go to Console tab
4. Enter test card number: `4242 4242 4242 4242`
5. Search console for "4242"

**Expected Result:**
- ✅ Card number NOT found in console logs
- ✅ Card number NOT in localStorage
- ✅ Card number NOT in network requests (Stripe handles it)

**To Verify:**
```javascript
// Paste in DevTools Console - should be empty/null
localStorage.getItem('cardNumber');
localStorage.getItem('cvv');
sessionStorage.getItem('cardNumber');
```

---

### 🔐 Test Case 7: No URL Parameter Injection

**Test Cases:**
1. `/checkout?plan=admin`
2. `/checkout?plan=../../etc/passwd`
3. `/checkout?plan=<script>alert('xss')</script>`
4. `/checkout?plan='; DROP TABLE--`

**Expected Result for all:**
- ✅ Redirects to /subscribe
- ❌ Does NOT process invalid plan
- ❌ Does NOT execute any scripts

---

### 🔐 Test Case 8: Token Management

**Steps:**
1. Login successfully
2. Open DevTools → Application → Local Storage
3. Check what's stored

**Expected Result:**
- ✅ `accessToken` stored (short-lived, e.g., 1 hour)
- ✅ `refreshToken` stored (long-lived)
- ✅ `tokenExpiresAt` stored (timestamp)
- ❌ No passwords stored
- ❌ No sensitive user data stored

**To Check Token Expiry:**
```javascript
// Paste in DevTools Console
const expiresAt = localStorage.getItem('tokenExpiresAt');
const now = Date.now();
const expiresIn = (parseInt(expiresAt) - now) / 1000 / 60; // minutes
console.log(`Token expires in ${expiresIn.toFixed(0)} minutes`);
```

---

### 🔐 Test Case 9: Logout Clears Tokens

**Steps:**
1. Login successfully
2. Verify tokens in localStorage (Test Case 8)
3. Click Logout
4. Check localStorage again

**Expected Result:**
- ✅ All tokens removed from localStorage
- ✅ Session cleared
- ✅ Cannot access protected routes

---

### 🔐 Test Case 10: Page Reload Maintains Session

**Steps:**
1. Login successfully
2. Note access token in localStorage
3. Refresh page (Ctrl+R)
4. Check if still authenticated

**Expected Result:**
- ✅ Still logged in after refresh
- ✅ Same tokens restored
- ✅ No re-login required

---

## Stripe Dashboard Monitoring

After running tests, verify in Stripe Dashboard:

1. Go to https://dashboard.stripe.com/test/payments
2. Look for your test transactions:
   - ✅ Successful payment should show status "Succeeded"
   - ❌ Failed payment should show "Failed"
   - Amount should match plan price

3. View payment intent details:
   - Click on transaction
   - Verify metadata contains `planName` and `churchId`
   - Check client IP and timestamp

---

## Performance Testing

### Network Tab Analysis

**Steps:**
1. Open DevTools → Network tab
2. Go through complete checkout flow
3. Examine requests:

**Expected Behavior:**
- ✅ `/api/billing/payment-intent` - creates intent, returns `clientSecret`
- ✅ Stripe API call (external) - only CardElement talks to Stripe
- ✅ `/api/subscriptions/activate` or similar - activates subscription after payment
- ❌ No requests containing card data in query params
- ❌ No card data in request/response bodies

---

## Error Handling Validation

### Test Error Scenarios

1. **Network Timeout:**
   - Disable network in DevTools
   - Try to submit payment
   - Expected: Generic error message, no details exposed

2. **Backend Error:**
   - Misconfigure API endpoint
   - Try to submit payment
   - Expected: Generic error message, dev logs only

3. **Stripe API Error:**
   - Use expired test key
   - Try to submit payment
   - Expected: Generic error message, no Stripe error code shown

---

## Compliance Checklist

Before deploying to production, verify:

- [ ] All test cases pass
- [ ] Card data never appears in console/network
- [ ] No hardcoded test keys in production code
- [ ] Error messages are generic (no backend details)
- [ ] Tokens properly managed (expiry tracked)
- [ ] Terms/Privacy links functional
- [ ] HTTPS enabled (required for Stripe)
- [ ] Stripe webhook handlers implemented
- [ ] PCI-DSS compliance checklist completed
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)

---

## Stripe Webhook Setup (Production)

When moving to production, implement webhooks:

```typescript
// Handle Stripe events
app.post('/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch(event.type) {
    case 'payment_intent.succeeded':
      // Activate subscription
      break;
    case 'payment_intent.payment_failed':
      // Send failure email
      break;
    case 'customer.subscription.deleted':
      // Downgrade subscription
      break;
  }

  res.json({received: true});
});
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Payment processing not available" | Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly |
| Card element not rendering | Check browser console for CORS errors |
| "Invalid API Key" | Verify key is for the correct environment (test vs live) |
| Network requests failing | Check API endpoint URL matches `VITE_API_URL` |
| Tokens not persisting | Check localStorage not disabled in browser |

---

**Last Updated:** 2024-10-30
**Status:** Ready for testing
**Next Step:** Execute all test cases and document results

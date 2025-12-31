# Upgrade EIN Security - Secrets Manager Integration

**Priority**: HIGH
**Effort**: 1-2 hours
**Impact**: Prevents encryption key theft

---

## Current State (Good, but can be better)

✅ **Current**: `ENCRYPTION_KEY=...` in `.env` file
⚠️ **Risk**: Anyone with server access can read `.env`

---

## Target State (Best Practice)

✅ **Target**: Key stored in AWS Secrets Manager / HashiCorp Vault
✅ **Benefit**: Key never stored on disk, audit trail for all access

---

## Implementation Options

### Option 1: AWS Secrets Manager (Recommended for Render)

**Step 1: Store Key in AWS Secrets Manager**
```bash
# Install AWS CLI
npm install -g aws-cli

# Store encryption key
aws secretsmanager create-secret \
  --name koinonia/production/encryption-key \
  --secret-string '{"ENCRYPTION_KEY":"a798f51485ab6663badd285ac9506a9f..."}'
```

**Step 2: Update Backend Code**
```typescript
// backend/src/config/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-west-2' });

export async function getEncryptionKey(): Promise<string> {
  const command = new GetSecretValueCommand({
    SecretId: 'koinonia/production/encryption-key',
  });

  const response = await client.send(command);
  const secret = JSON.parse(response.SecretString!);
  return secret.ENCRYPTION_KEY;
}
```

**Step 3: Update Encryption Utils**
```typescript
// backend/src/utils/encryption.utils.ts
import { getEncryptionKey } from '../config/secrets.js';

let ENCRYPTION_KEY: string | null = null;

async function getKey(): Promise<string> {
  if (!ENCRYPTION_KEY) {
    ENCRYPTION_KEY = await getEncryptionKey();
  }
  return ENCRYPTION_KEY;
}

export async function encryptEIN(ein: string): Promise<string> {
  const key = await getKey();
  // ... rest of encryption logic
}
```

**Cost**: ~$0.40/month (AWS Secrets Manager pricing)

---

### Option 2: Render Environment Variables with Restricted Access

**Step 1: Set in Render Dashboard**
1. Go to Render Dashboard → Your Service → Environment
2. Add `ENCRYPTION_KEY` as environment variable
3. Enable "Restrict Access" (only service owners can view)

**Step 2: Remove from `.env`**
```bash
# .env - Remove or comment out
# ENCRYPTION_KEY=a798f51485ab6663badd285ac9506a9f...
```

**Step 3: Add Validation**
```typescript
// backend/src/utils/encryption.utils.ts
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY must be set in environment');
}

if (ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be 64 hex characters');
}
```

**Cost**: Free

---

### Option 3: HashiCorp Vault (Enterprise)

**For larger organizations with compliance requirements**

```bash
# Install Vault
vault kv put secret/koinonia/encryption-key value=a798f51485ab6663...

# Backend retrieves key
vault kv get -field=value secret/koinonia/encryption-key
```

**Cost**: $0 (self-hosted) or $0.03/hour (Vault Cloud)

---

## Additional Hardening

### 1. Key Rotation Strategy

```typescript
// backend/src/services/ein-rotation.service.ts
export async function rotateEncryptionKey(
  oldKey: string,
  newKey: string
): Promise<void> {
  const churches = await registryPrisma.church.findMany({
    where: { ein: { not: null } }
  });

  for (const church of churches) {
    // Decrypt with old key
    const plainEIN = decryptEINWithKey(church.ein!, oldKey);

    // Re-encrypt with new key
    const newEncrypted = encryptEINWithKey(plainEIN, newKey);

    // Update database
    await registryPrisma.church.update({
      where: { id: church.id },
      data: { ein: newEncrypted }
    });
  }
}
```

**When to rotate**:
- Annually (best practice)
- After employee departure
- After suspected breach
- After key exposure

---

### 2. Multi-Party Encryption (Advanced)

**Concept**: Split key across multiple parties, require 2+ to decrypt

```typescript
// Shamir's Secret Sharing
import { split, combine } from 'shamirs-secret-sharing';

// Split key into 5 shares, require 3 to reconstruct
const shares = split(encryptionKey, { shares: 5, threshold: 3 });

// Store shares with:
// - Share 1: AWS Secrets Manager
// - Share 2: HashiCorp Vault
// - Share 3: Hardware security module
// - Share 4: Offline backup (safe deposit box)
// - Share 5: Disaster recovery location

// To decrypt, need any 3 shares
const reconstructedKey = combine([share1, share2, share3]);
```

**Use case**: Ultra-high security requirements (healthcare, finance)

---

### 3. Hardware Security Module (HSM)

**Concept**: Key never leaves dedicated hardware

```typescript
// AWS CloudHSM
import { CloudHSMClient } from '@aws-sdk/client-cloudhsm';

// Key stored in tamper-resistant hardware
// Decryption happens inside HSM
// Plaintext EIN never exposed to application
```

**Cost**: ~$1/hour (~$720/month)
**Use case**: PCI DSS Level 1, HIPAA compliance

---

## Comparison Table

| Solution | Security | Cost | Complexity | Best For |
|----------|----------|------|------------|----------|
| `.env` file | ⭐⭐⭐ | Free | Easy | Development |
| Render Env Vars | ⭐⭐⭐⭐ | Free | Easy | Small production |
| AWS Secrets Manager | ⭐⭐⭐⭐⭐ | $0.40/mo | Medium | Production SaaS |
| HashiCorp Vault | ⭐⭐⭐⭐⭐ | $20/mo | Hard | Enterprise |
| Multi-Party | ⭐⭐⭐⭐⭐⭐ | $5/mo | Very Hard | High security |
| HSM | ⭐⭐⭐⭐⭐⭐⭐ | $720/mo | Very Hard | Compliance-critical |

---

## Recommendation for Koinonia

**Phase 1** (Now - Next Week):
✅ Move `ENCRYPTION_KEY` to Render environment variables with restricted access
✅ Remove from `.env` file
✅ Add startup validation

**Phase 2** (Next Month):
✅ Integrate AWS Secrets Manager
✅ Implement audit logging for key access
✅ Set up annual key rotation reminder

**Phase 3** (When Scaling):
✅ Consider HSM if handling >10,000 churches
✅ Implement multi-party encryption for disaster recovery

---

## Implementation Script

```bash
#!/bin/bash
# Quick setup for Render environment variables

echo "🔒 EIN Security Upgrade - Render Environment Variables"
echo ""

# Step 1: Check current key
if [ -f backend/.env ]; then
  CURRENT_KEY=$(grep ENCRYPTION_KEY backend/.env | cut -d'=' -f2)
  echo "✅ Found encryption key in .env"
  echo "   Key (first 16 chars): ${CURRENT_KEY:0:16}..."
else
  echo "❌ No .env file found"
  exit 1
fi

# Step 2: Instructions
echo ""
echo "📋 Manual Steps Required:"
echo ""
echo "1. Go to: https://dashboard.render.com/web/YOUR_SERVICE/env"
echo "2. Click 'Add Environment Variable'"
echo "3. Set:"
echo "   Key: ENCRYPTION_KEY"
echo "   Value: $CURRENT_KEY"
echo "4. Enable 'Restrict Access' (only owners can view)"
echo "5. Click 'Save Changes'"
echo ""
echo "6. Then run: git add backend/.env && git restore backend/.env"
echo "   (This removes ENCRYPTION_KEY from .env without committing it)"
echo ""
echo "7. Redeploy your service"
echo ""
echo "✅ After deployment, verify encryption still works"
```

---

## Testing Checklist

After implementing secrets manager:

- [ ] Backend starts successfully
- [ ] Can encrypt new EIN
- [ ] Can decrypt existing EIN
- [ ] 10DLC registration works
- [ ] Audit logs show correct access
- [ ] `.env` file does NOT contain key
- [ ] Old EINs still decrypt correctly

---

## Rollback Plan

If something goes wrong:

```bash
# Emergency rollback
1. Add ENCRYPTION_KEY back to .env
2. Restart backend: pm2 restart all
3. Verify decryption works
4. Investigate issue
5. Fix and retry secrets manager setup
```

---

**Questions?** Review AWS Secrets Manager docs: https://docs.aws.amazon.com/secretsmanager/

# Database Migration Fix - Member phoneHash Column

## Problem
Member CSV import was failing with error:
```
Invalid `prisma.member.findUnique()` invocation: The column `Member.phoneHash` does not exist in the current database.
```

## Root Cause
The Prisma schema defines a `phoneHash` column in the Member model (for secure phone number lookups), but the production PostgreSQL database was missing this column. The existing migration (`20251104092007_add_phone_encryption`) was written for SQLite, not PostgreSQL.

## Solution
Created a new PostgreSQL-compatible migration:
- **File**: `backend/prisma/migrations/20251104_add_phone_hash_pg/migration.sql`
- **Changes**:
  - Adds `phoneHash` column to Member table
  - Creates unique index on phoneHash
  - Creates regular index on phoneHash
  - Uses `IF NOT EXISTS` to be idempotent

## Migration Details

### What phoneHash Is Used For
- **Security**: Allows searching members by phone number without exposing the encrypted phone column
- **Implementation**: Uses HMAC-SHA256 hash of the E.164-formatted phone number
- **Database**: Used for `findUnique()` queries when importing/managing members

### Why It Was Missing
1. Initial PostgreSQL schema didn't include phoneHash
2. Subsequent SQLite migration wasn't applied to PostgreSQL
3. Member import code calls `findUnique({ where: { phoneHash } })` which requires the column

## Deployment
✅ Migration committed to `main` branch
✅ Pushed to GitHub
⏳ Render will automatically deploy and run migration on next build

## Code Changes Summary
No code changes needed - the backend already properly:
1. Computes phoneHash using `hashForSearch(formattedPhone)`
2. Includes phoneHash when creating members
3. Uses phoneHash for lookups

## Next Steps After Deployment
1. Wait 2-3 minutes for Render to build and deploy
2. Test member CSV import again
3. Verify members are imported successfully
4. Verify phoneHash values are populated in database

## Files Modified
- ✅ `backend/prisma/migrations/20251104_add_phone_hash_pg/migration.sql` (NEW)

## Testing
Once deployed, test with CSV containing:
```
First Name, Last Name, Phone, Email
John, Doe, (555) 123-4567, john@example.com
```

Expected result: Member imported successfully with phoneHash populated.

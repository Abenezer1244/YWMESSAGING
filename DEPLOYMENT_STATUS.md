# Deployment Status - November 20, 2025

## Latest Deployments

### Commit 6b01ad1: Telnyx Entity Type Validation Fix
- **Status**: Ready for deployment
- **Changes**: 
  - Backend: Entity type whitelist (NON_PROFIT, PRIVATE_CORPORATION, PUBLIC_CORPORATION, GOVERNMENT_ENTITY)
  - Frontend: Updated dropdowns to only show supported types
  - Validation: Defaults to NON_PROFIT if unsupported type selected
- **Testing**: ✅ Builds successfully, zero errors

### Commit 5c0d8b3: DER Encoding Length Fix
- **Status**: ✅ Deployed
- **Changes**: Fixed ED25519 public key DER encoding (0x28 → 0x2a)

### Commit 70cb754: 7 Bug Fixes
- **Status**: ✅ Deployed
- **Changes**: 4 CRITICAL + 2 HIGH + 1 MEDIUM bug fixes

## GitHub Pro Upgrade
- **Activated**: November 20, 2025
- **Unlimited CI/CD minutes enabled**
- Auto-deploy should now work without minute restrictions

## Next Steps
1. Monitor Render deployment for commit 6b01ad1
2. Verify Settings page dropdown changes
3. Test brand registration with NON_PROFIT entity type

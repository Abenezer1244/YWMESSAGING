/**
 * ============================================================================
 * EIN SERVICE - Secure Handling of Employer Identification Numbers
 * ============================================================================
 *
 * SECURITY REQUIREMENTS:
 * - EIN is highly sensitive PII (can be used for identity theft, fraud)
 * - MUST be encrypted at rest using AES-256-GCM
 * - MUST be masked in UI (show only last 4 digits)
 * - All access MUST be audited (who, when, why)
 * - Decryption should only happen when absolutely necessary
 * - Never log decrypted EIN values
 *
 * COMPLIANCE:
 * - IRS Publication 5199 requires safeguarding EINs
 * - PCI DSS Level 1 standards for sensitive data handling
 * - SOC 2 Type II audit requirements
 */
/**
 * Audit reasons for EIN access
 */
export type EINAccessReason = 'ADMIN_UPDATE' | '10DLC_REGISTRATION' | 'ADMIN_VIEW' | 'SUPPORT_REQUEST' | 'DATA_MIGRATION' | 'AUDIT_COMPLIANCE';
/**
 * ============================================================================
 * STORE EIN - Encrypt and save to database with audit trail
 * ============================================================================
 */
export declare function storeEIN(churchId: string, plainEIN: string, accessedBy: string, reason?: EINAccessReason): Promise<void>;
/**
 * ============================================================================
 * GET EIN - Decrypt and return with audit trail
 * ============================================================================
 *
 * CRITICAL: Only call this when EIN is absolutely needed (e.g., Telnyx API call)
 * Do NOT call this for display purposes - use getEINMasked() instead
 */
export declare function getEIN(churchId: string, accessedBy: string, reason: EINAccessReason): Promise<string | null>;
/**
 * ============================================================================
 * GET EIN MASKED - Return masked EIN for display (XX-XXX5678)
 * ============================================================================
 *
 * Use this for UI display - does NOT decrypt full EIN
 * Shows only last 4 digits for verification
 */
export declare function getEINMasked(churchId: string): Promise<string | null>;
/**
 * ============================================================================
 * CHECK EIN EXISTS - Verify if church has EIN without decrypting
 * ============================================================================
 */
export declare function hasEIN(churchId: string): Promise<boolean>;
/**
 * ============================================================================
 * DELETE EIN - Remove from database with audit trail
 * ============================================================================
 */
export declare function deleteEIN(churchId: string, deletedBy: string, reason?: EINAccessReason): Promise<void>;
/**
 * ============================================================================
 * MIGRATE PLAIN TEXT EIN - Convert legacy plain text EIN to encrypted
 * ============================================================================
 *
 * Use this for one-time migration of existing plain text EINs
 */
export declare function migratePlainTextEIN(churchId: string): Promise<boolean>;
//# sourceMappingURL=ein.service.d.ts.map
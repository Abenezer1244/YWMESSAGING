/**
 * Generate TOTP secret and QR code
 */
export declare function generateMFASecret(email: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    manualEntryKey: string;
}>;
/**
 * Enable MFA for an admin
 */
export declare function enableMFA(adminId: string, totpSecret: string, verifyCode: string, email: string): Promise<{
    mfaEnabled: boolean;
    recoveryCodes: string[];
    message: string;
}>;
/**
 * Verify TOTP code
 */
export declare function verifyTOTPCode(adminId: string, code: string): Promise<boolean>;
/**
 * Verify recovery code
 */
export declare function verifyRecoveryCode(adminId: string, code: string): Promise<boolean>;
/**
 * Disable MFA
 */
export declare function disableMFA(adminId: string, verifyCode: string): Promise<void>;
/**
 * Get MFA status
 */
export declare function getMFAStatus(adminId: string): Promise<{
    mfaEnabled: boolean;
    backupCodesRemaining: number;
    enabledAt: null;
    lastVerifiedAt?: undefined;
} | {
    mfaEnabled: boolean;
    backupCodesRemaining: number;
    enabledAt: Date | null;
    lastVerifiedAt: Date | null;
}>;
/**
 * Generate recovery codes
 */
export declare function generateRecoveryCodes(adminId: string, count?: number): Promise<string[]>;
/**
 * Get recovery code status
 */
export declare function getRecoveryCodeStatus(adminId: string): Promise<{
    totalCodes: number;
    usedCodes: any;
    remainingCodes: number;
}>;
//# sourceMappingURL=mfa.service.d.ts.map
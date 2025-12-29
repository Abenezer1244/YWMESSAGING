/**
 * Phone Number Registry Service
 * Maps Telnyx phone numbers to tenant (church) IDs
 * TODO: Implement after core architecture validation
 */
export declare function registerPhoneNumber(tenantId: string, phoneNumber: string): Promise<void>;
export declare function unregisterPhoneNumber(phoneNumber: string): Promise<void>;
export declare function getTenantByPhoneNumber(phoneNumber: string): Promise<string | null>;
export declare function updatePhoneNumberTenant(phoneNumber: string, newTenantId: string): Promise<void>;
export declare function getPhoneNumbersByTenant(tenantId: string): Promise<string[]>;
export declare function isPhoneNumberAvailable(phoneNumber: string): Promise<boolean>;
//# sourceMappingURL=phone-registry.service.d.ts.map
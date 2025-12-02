/**
 * Planning Center Integration Service
 *
 * Integrates with Planning Center Online (PCO) to:
 * - Import members and volunteers
 * - Sync service schedules for event-based messaging
 * - Track integration status
 * - Handle OAuth2 authentication
 *
 * Planning Center API: https://api.planningcenteronline.com/v2
 * Authentication: OAuth2 Bearer Token or Personal Access Token
 */
/**
 * Planning Center OAuth2 credentials
 */
export interface PlanningCenterOAuth2 {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    clientId: string;
    clientSecret: string;
}
/**
 * PCO Member/Person record
 */
export interface PCOMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    status: 'active' | 'inactive';
    integrationStatus?: 'synced' | 'pending' | 'failed';
}
/**
 * PCO Service/Event record
 */
export interface PCOService {
    id: string;
    name: string;
    description?: string;
    plannedAt: Date;
    series?: string;
    serviceType: string;
}
/**
 * Planning Center Integration config for a church
 */
export interface PlanningCenterIntegration {
    churchId: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    organizationId: string;
    isEnabled: boolean;
    lastSyncAt?: Date;
    syncStatus: 'active' | 'failed' | 'pending';
    errorMessage?: string;
    memberSyncEnabled: boolean;
    serviceSyncEnabled: boolean;
}
/**
 * Sync result tracking
 */
export interface SyncResult {
    success: boolean;
    itemsProcessed: number;
    itemsCreated: number;
    itemsUpdated: number;
    itemsFailed: number;
    duration: number;
    error?: string;
}
/**
 * Connect Planning Center to a church (OAuth2)
 * Stores credentials securely in database
 */
export declare function connectPlanningCenter(churchId: string, accessToken: string, refreshToken?: string, expiresIn?: number): Promise<PlanningCenterIntegration>;
/**
 * Get Planning Center integration status
 */
export declare function getPlanningCenterStatus(churchId: string): Promise<PlanningCenterIntegration | null>;
/**
 * Sync members from Planning Center into YW Messaging
 * Creates or updates Member records
 */
export declare function syncPlanningCenterMembers(churchId: string): Promise<SyncResult>;
/**
 * Disconnect Planning Center from a church
 * Revokes access token and disables integration
 */
export declare function disconnectPlanningCenter(churchId: string): Promise<void>;
/**
 * Validate Planning Center integration setup
 */
export declare function validatePlanningCenterSetup(churchId: string): Promise<{
    valid: boolean;
    error?: string;
}>;
//# sourceMappingURL=planning-center.service.d.ts.map
import { TenantPrismaClient } from '../lib/tenant-prisma.js';
/**
 * Onboarding Service - Tracks and verifies onboarding task completion
 * Each task is verified against actual data (e.g., branch was created, members were added)
 * PHASE 5: Multi-tenant refactoring - uses tenantPrisma for tenant-scoped queries
 */
type TaskId = 'create_branch' | 'add_members' | 'send_message';
interface OnboardingStatus {
    taskId: TaskId;
    completed: boolean;
    completedAt?: Date;
}
/**
 * Get all onboarding progress for a church
 */
export declare function getOnboardingProgress(tenantId: string, tenantPrisma: TenantPrismaClient): Promise<OnboardingStatus[]>;
/**
 * Verify and mark a task as completed
 * Checks if the task has actually been completed before marking it done
 */
export declare function completeOnboardingTask(tenantId: string, tenantPrisma: TenantPrismaClient, taskId: TaskId): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Get onboarding progress percentage
 */
export declare function getOnboardingProgressPercentage(tenantId: string, tenantPrisma: TenantPrismaClient): Promise<number>;
/**
 * Check if onboarding is fully complete
 */
export declare function isOnboardingComplete(tenantId: string, tenantPrisma: TenantPrismaClient): Promise<boolean>;
/**
 * Get summary of onboarding status
 */
export declare function getOnboardingSummary(tenantId: string, tenantPrisma: TenantPrismaClient): Promise<{
    completedTasks: TaskId[];
    remainingTasks: TaskId[];
    percentageComplete: number;
    isComplete: boolean;
}>;
export {};
//# sourceMappingURL=onboarding.service.d.ts.map
/**
 * Onboarding Service - Tracks and verifies onboarding task completion
 * Each task is verified against actual data (e.g., branch was created, members were added)
 */
type TaskId = 'create_branch' | 'create_group' | 'add_members' | 'send_message';
interface OnboardingStatus {
    taskId: TaskId;
    completed: boolean;
    completedAt?: Date;
}
/**
 * Get all onboarding progress for a church
 */
export declare function getOnboardingProgress(churchId: string): Promise<OnboardingStatus[]>;
/**
 * Verify and mark a task as completed
 * Checks if the task has actually been completed before marking it done
 */
export declare function completeOnboardingTask(churchId: string, taskId: TaskId): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Get onboarding progress percentage
 */
export declare function getOnboardingProgressPercentage(churchId: string): Promise<number>;
/**
 * Check if onboarding is fully complete
 */
export declare function isOnboardingComplete(churchId: string): Promise<boolean>;
/**
 * Get summary of onboarding status
 */
export declare function getOnboardingSummary(churchId: string): Promise<{
    completedTasks: TaskId[];
    remainingTasks: TaskId[];
    percentageComplete: number;
    isComplete: boolean;
}>;
export {};
//# sourceMappingURL=onboarding.service.d.ts.map
/**
 * Get all onboarding progress for a church
 */
export async function getOnboardingProgress(tenantId, tenantPrisma) {
    const progress = await tenantPrisma.onboardingProgress.findMany({
        select: {
            taskId: true,
            completed: true,
            completedAt: true,
        },
    });
    // Return all known tasks, even if not yet created in DB
    const allTasks = ['create_branch', 'add_members', 'send_message'];
    return allTasks.map(taskId => {
        const found = progress.find(p => p.taskId === taskId);
        return {
            taskId,
            completed: found?.completed ?? false,
            completedAt: found?.completedAt ?? undefined,
        };
    });
}
/**
 * Verify and mark a task as completed
 * Checks if the task has actually been completed before marking it done
 */
export async function completeOnboardingTask(tenantId, tenantPrisma, taskId) {
    // Verify the task has actually been completed
    const isCompleted = await verifyTaskCompletion(tenantId, tenantPrisma, taskId);
    if (!isCompleted) {
        return {
            success: false,
            message: `Task "${taskId}" has not been completed yet. Please complete the required action first.`,
        };
    }
    // Upsert the onboarding progress record
    await tenantPrisma.onboardingProgress.upsert({
        where: { taskId },
        update: {
            completed: true,
            completedAt: new Date(),
            updatedAt: new Date(),
        },
        create: {
            taskId,
            completed: true,
            completedAt: new Date(),
        },
    });
    return {
        success: true,
        message: `Task "${taskId}" marked as completed`,
    };
}
/**
 * Verify that a task has actually been completed
 * This checks the actual data in the database
 */
async function verifyTaskCompletion(tenantId, tenantPrisma, taskId) {
    switch (taskId) {
        case 'create_branch':
            // Check if church has at least one branch
            const branchCount = await tenantPrisma.branch.count();
            return branchCount > 0;
        case 'add_members':
            // Check if church has at least one conversation (which requires a member)
            const conversationCount = await tenantPrisma.conversation.count();
            return conversationCount > 0;
        case 'send_message':
            // Check if church has sent at least one message
            const messageCount = await tenantPrisma.message.count();
            return messageCount > 0;
        default:
            return false;
    }
}
/**
 * Get onboarding progress percentage
 */
export async function getOnboardingProgressPercentage(tenantId, tenantPrisma) {
    const progress = await getOnboardingProgress(tenantId, tenantPrisma);
    const completedCount = progress.filter(p => p.completed).length;
    return Math.round((completedCount / progress.length) * 100);
}
/**
 * Check if onboarding is fully complete
 */
export async function isOnboardingComplete(tenantId, tenantPrisma) {
    const progress = await getOnboardingProgress(tenantId, tenantPrisma);
    return progress.every(p => p.completed);
}
/**
 * Get summary of onboarding status
 */
export async function getOnboardingSummary(tenantId, tenantPrisma) {
    const progress = await getOnboardingProgress(tenantId, tenantPrisma);
    const completedTasks = progress.filter(p => p.completed).map(p => p.taskId);
    const remainingTasks = progress.filter(p => !p.completed).map(p => p.taskId);
    return {
        completedTasks,
        remainingTasks,
        percentageComplete: Math.round((completedTasks.length / progress.length) * 100),
        isComplete: remainingTasks.length === 0,
    };
}
//# sourceMappingURL=onboarding.service.js.map
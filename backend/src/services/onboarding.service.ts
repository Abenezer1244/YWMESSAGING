import { prisma } from '../lib/prisma.js';

/**
 * Onboarding Service - Tracks and verifies onboarding task completion
 * Each task is verified against actual data (e.g., branch was created, members were added)
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
export async function getOnboardingProgress(churchId: string): Promise<OnboardingStatus[]> {
  const progress = await prisma.onboardingProgress.findMany({
    where: { churchId },
    select: {
      taskId: true,
      completed: true,
      completedAt: true,
    },
  });

  // Return all known tasks, even if not yet created in DB
  const allTasks: TaskId[] = ['create_branch', 'add_members', 'send_message'];

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
export async function completeOnboardingTask(
  churchId: string,
  taskId: TaskId
): Promise<{ success: boolean; message: string }> {
  // Verify the task has actually been completed
  const isCompleted = await verifyTaskCompletion(churchId, taskId);

  if (!isCompleted) {
    return {
      success: false,
      message: `Task "${taskId}" has not been completed yet. Please complete the required action first.`,
    };
  }

  // Upsert the onboarding progress record
  await prisma.onboardingProgress.upsert({
    where: { churchId_taskId: { churchId, taskId } },
    update: {
      completed: true,
      completedAt: new Date(),
      updatedAt: new Date(),
    },
    create: {
      churchId,
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
async function verifyTaskCompletion(churchId: string, taskId: TaskId): Promise<boolean> {
  switch (taskId) {
    case 'create_branch':
      // Check if church has at least one branch
      const branchCount = await prisma.branch.count({
        where: { churchId },
      });
      return branchCount > 0;

    case 'add_members':
      // Check if church has at least one conversation (which requires a member)
      const conversationCount = await prisma.conversation.count({
        where: { churchId },
      });
      return conversationCount > 0;

    case 'send_message':
      // Check if church has sent at least one message
      const messageCount = await prisma.message.count({
        where: { churchId },
      });
      return messageCount > 0;

    default:
      return false;
  }
}

/**
 * Get onboarding progress percentage
 */
export async function getOnboardingProgressPercentage(churchId: string): Promise<number> {
  const progress = await getOnboardingProgress(churchId);
  const completedCount = progress.filter(p => p.completed).length;
  return Math.round((completedCount / progress.length) * 100);
}

/**
 * Check if onboarding is fully complete
 */
export async function isOnboardingComplete(churchId: string): Promise<boolean> {
  const progress = await getOnboardingProgress(churchId);
  return progress.every(p => p.completed);
}

/**
 * Get summary of onboarding status
 */
export async function getOnboardingSummary(churchId: string): Promise<{
  completedTasks: TaskId[];
  remainingTasks: TaskId[];
  percentageComplete: number;
  isComplete: boolean;
}> {
  const progress = await getOnboardingProgress(churchId);
  const completedTasks = progress.filter(p => p.completed).map(p => p.taskId);
  const remainingTasks = progress.filter(p => !p.completed).map(p => p.taskId);

  return {
    completedTasks,
    remainingTasks,
    percentageComplete: Math.round((completedTasks.length / progress.length) * 100),
    isComplete: remainingTasks.length === 0,
  };
}

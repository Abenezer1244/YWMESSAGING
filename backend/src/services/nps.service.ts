/**
 * NPS (Net Promoter Score) Service
 * Handles survey submission, analytics, and feedback collection
 */

import { prisma } from '../lib/prisma.js';
import * as cacheService from './cache.service.js';

// ============================================================================
// Types
// ============================================================================

export interface NPSSurveyInput {
  score: number; // 0-10
  category: string; // feedback, feature_request, bug, general, other
  feedback?: string;
  followupEmail?: string;
}

export interface NPSSurveyResponse {
  id: string;
  churchId: string;
  score: number;
  category: string;
  sentiment: string | null;
  feedback?: string;
  createdAt: Date;
}

export interface NPSAnalytics {
  totalResponses: number;
  npsScore: number; // NPS = % Promoters - % Detractors
  averageScore: number;
  scoreDistribution: {
    detractors: number; // 0-6
    passives: number; // 7-8
    promoters: number; // 9-10
  };
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topFeedback: Array<{
    feedback: string;
    count: number;
    sentiment: string;
  }>;
}

// ============================================================================
// NPS Service Functions
// ============================================================================

/**
 * Submit NPS survey response
 */
export async function submitNPSSurvey(
  churchId: string,
  responderId: string | undefined,
  input: NPSSurveyInput
): Promise<NPSSurveyResponse> {
  // Validate score
  if (input.score < 0 || input.score > 10 || !Number.isInteger(input.score)) {
    throw new Error('NPS score must be an integer between 0 and 10');
  }

  // Validate category
  const validCategories = ['feedback', 'feature_request', 'bug', 'general', 'other'];
  if (!validCategories.includes(input.category)) {
    throw new Error(
      `Invalid category. Must be one of: ${validCategories.join(', ')}`
    );
  }

  // Detect sentiment from feedback (simple approach)
  let sentiment: string | null = null;
  if (input.feedback) {
    sentiment = detectSentiment(input.feedback);
  }

  // Create survey response
  const survey = await prisma.nPSSurvey.create({
    data: {
      churchId,
      responderId,
      score: input.score,
      category: input.category,
      feedback: input.feedback || null,
      sentiment,
      followupEmail: input.followupEmail || null,
    },
  });

  // Invalidate analytics cache
  await invalidateNPSCache(churchId);

  return {
    id: survey.id,
    churchId: survey.churchId,
    score: survey.score,
    category: survey.category,
    sentiment: survey.sentiment,
    feedback: survey.feedback || undefined,
    createdAt: survey.createdAt,
  };
}

/**
 * Get NPS analytics for a church
 */
export async function getNPSAnalytics(
  churchId: string,
  daysBack: number = 30
): Promise<NPSAnalytics> {
  // Try cache first
  const cacheKey = `nps:analytics:${churchId}`;
  const cached = await cacheService.getCached<NPSAnalytics>(cacheKey);
  if (cached) {
    return cached;
  }

  // Get surveys from last N days
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const surveys = await prisma.nPSSurvey.findMany({
    where: {
      churchId,
      createdAt: { gte: cutoffDate },
    },
  });

  if (surveys.length === 0) {
    const emptyAnalytics: NPSAnalytics = {
      totalResponses: 0,
      npsScore: 0,
      averageScore: 0,
      scoreDistribution: { detractors: 0, passives: 0, promoters: 0 },
      sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
      topFeedback: [],
    };

    // Cache for 1 hour
    await cacheService.setCached(cacheKey, emptyAnalytics, 3600);
    return emptyAnalytics;
  }

  // Calculate score distribution
  const scoreDistribution = {
    detractors: surveys.filter((s) => s.score <= 6).length, // 0-6
    passives: surveys.filter((s) => s.score === 7 || s.score === 8).length, // 7-8
    promoters: surveys.filter((s) => s.score >= 9).length, // 9-10
  };

  // Calculate NPS score
  const npsScore = Math.round(
    ((scoreDistribution.promoters - scoreDistribution.detractors) /
      surveys.length) *
      100
  );

  // Calculate average score
  const averageScore =
    surveys.reduce((sum, s) => sum + s.score, 0) / surveys.length;

  // Calculate sentiment breakdown
  const sentimentBreakdown = {
    positive: surveys.filter((s) => s.sentiment === 'positive').length,
    neutral: surveys.filter((s) => s.sentiment === 'neutral').length,
    negative: surveys.filter((s) => s.sentiment === 'negative').length,
  };

  // Get top feedback comments (group by feedback, count occurrences)
  const feedbackMap = new Map<string, { sentiment: string; count: number }>();
  surveys.forEach((survey) => {
    if (survey.feedback && survey.feedback.length > 0) {
      const existing = feedbackMap.get(survey.feedback);
      if (existing) {
        existing.count++;
      } else {
        feedbackMap.set(survey.feedback, {
          sentiment: survey.sentiment || 'neutral',
          count: 1,
        });
      }
    }
  });

  const topFeedback = Array.from(feedbackMap.entries())
    .map(([feedback, data]) => ({
      feedback,
      count: data.count,
      sentiment: data.sentiment,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5

  const analytics: NPSAnalytics = {
    totalResponses: surveys.length,
    npsScore,
    averageScore: Math.round(averageScore * 10) / 10,
    scoreDistribution,
    sentimentBreakdown,
    topFeedback,
  };

  // Cache for 1 hour
  await cacheService.setCached(cacheKey, analytics, 3600);

  return analytics;
}

/**
 * Get recent surveys for a church
 */
export async function getRecentSurveys(
  churchId: string,
  limit: number = 20,
  offset: number = 0
): Promise<NPSSurveyResponse[]> {
  const surveys = await prisma.nPSSurvey.findMany({
    where: { churchId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  return surveys.map((survey) => ({
    id: survey.id,
    churchId: survey.churchId,
    score: survey.score,
    category: survey.category,
    sentiment: survey.sentiment,
    feedback: survey.feedback || undefined,
    createdAt: survey.createdAt,
  }));
}

/**
 * Get NPS score by category
 */
export async function getNPSByCategory(
  churchId: string,
  daysBack: number = 30
): Promise<Record<string, number>> {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const surveys = await prisma.nPSSurvey.findMany({
    where: {
      churchId,
      createdAt: { gte: cutoffDate },
    },
  });

  const categoryStats: Record<string, number> = {};

  surveys.forEach((survey) => {
    if (!categoryStats[survey.category]) {
      categoryStats[survey.category] = 0;
    }
    categoryStats[survey.category] += survey.score;
  });

  // Convert sums to averages
  const result: Record<string, number> = {};
  surveys.forEach((survey) => {
    const count = surveys.filter((s) => s.category === survey.category).length;
    if (count > 0) {
      result[survey.category] = Math.round(
        (categoryStats[survey.category] / count) * 10
      ) / 10;
    }
  });

  return result;
}

/**
 * Detect sentiment from feedback text (simple keyword-based)
 */
function detectSentiment(feedback: string): string {
  const positiveKeywords = [
    'great',
    'excellent',
    'amazing',
    'love',
    'perfect',
    'helpful',
    'good',
    'wonderful',
    'fantastic',
    'brilliant',
  ];
  const negativeKeywords = [
    'bad',
    'terrible',
    'awful',
    'hate',
    'poor',
    'broken',
    'useless',
    'slow',
    'frustrat',
    'annoying',
    'issue',
    'problem',
  ];

  const lowerFeedback = feedback.toLowerCase();
  const hasPositive = positiveKeywords.some((kw) => lowerFeedback.includes(kw));
  const hasNegative = negativeKeywords.some((kw) => lowerFeedback.includes(kw));

  if (hasPositive && !hasNegative) {
    return 'positive';
  } else if (hasNegative && !hasPositive) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

/**
 * Invalidate NPS cache for a church
 */
export async function invalidateNPSCache(churchId: string): Promise<void> {
  await cacheService.invalidateCache(`nps:analytics:${churchId}`);
  await cacheService.invalidateCache(`nps:category:${churchId}`);
}

/**
 * Send followup email to survey respondent
 * (Placeholder - integrate with Resend email service)
 */
export async function sendFollowupEmail(
  surveyId: string,
  email: string,
  message: string
): Promise<void> {
  // TODO: Integrate with Resend email service
  // For now, just mark as sent in database
  await prisma.nPSSurvey.update({
    where: { id: surveyId },
    data: { followupSent: true },
  });
}

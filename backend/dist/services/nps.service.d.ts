/**
 * NPS (Net Promoter Score) Service
 * Handles survey submission, analytics, and feedback collection
 */
export interface NPSSurveyInput {
    score: number;
    category: string;
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
    npsScore: number;
    averageScore: number;
    scoreDistribution: {
        detractors: number;
        passives: number;
        promoters: number;
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
/**
 * Submit NPS survey response
 */
export declare function submitNPSSurvey(churchId: string, responderId: string | undefined, input: NPSSurveyInput): Promise<NPSSurveyResponse>;
/**
 * Get NPS analytics for a church
 */
export declare function getNPSAnalytics(churchId: string, daysBack?: number): Promise<NPSAnalytics>;
/**
 * Get recent surveys for a church
 */
export declare function getRecentSurveys(churchId: string, limit?: number, offset?: number): Promise<NPSSurveyResponse[]>;
/**
 * Get NPS score by category
 */
export declare function getNPSByCategory(churchId: string, daysBack?: number): Promise<Record<string, number>>;
/**
 * Invalidate NPS cache for a church
 */
export declare function invalidateNPSCache(churchId: string): Promise<void>;
/**
 * Send followup email to survey respondent
 * (Placeholder - integrate with Resend email service)
 */
export declare function sendFollowupEmail(surveyId: string, email: string, message: string): Promise<void>;
//# sourceMappingURL=nps.service.d.ts.map
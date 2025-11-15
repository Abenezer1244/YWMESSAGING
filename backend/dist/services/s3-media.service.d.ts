export interface MediaMetadata {
    type: 'image' | 'video' | 'audio' | 'document';
    sizeBytes: number;
    mimeType: string;
    width?: number;
    height?: number;
    duration?: number;
}
/**
 * Download media from Telnyx CDN and upload to S3
 * Called when MMS is received from congregation member
 * NO COMPRESSION - stores full quality
 */
export declare function downloadAndUploadMedia(telnyxMediaUrl: string, conversationId: string, fileName: string): Promise<{
    s3Key: string;
    s3Url: string;
    metadata: MediaMetadata;
}>;
/**
 * Upload media file from dashboard (leader upload)
 * Called when leader clicks [📎] and selects file
 * NO COMPRESSION - stores full quality
 */
export declare function uploadMediaFromFile(filePath: string, conversationId: string, fileName: string, mimeType: string): Promise<{
    s3Key: string;
    s3Url: string;
    metadata: MediaMetadata;
}>;
/**
 * Delete media from S3
 * Called when conversation is deleted or admin removes media
 */
export declare function deleteMedia(s3Key: string): Promise<void>;
/**
 * Refresh/generate presigned URL for existing media
 * Called when existing URL is about to expire
 */
export declare function getPresignedUrl(s3Key: string, expirationSeconds?: number): Promise<string>;
/**
 * Get media info (for dashboard preview)
 */
export declare function getMediaInfo(s3Key: string): Promise<{
    url: string;
    size: number;
    lastModified: Date;
}>;
/**
 * Cleanup old media based on retention policy
 * Run daily via cron job or Lambda
 */
export declare function deleteOldMedia(retentionDays?: number): Promise<number>;
/**
 * Validate media file for upload
 */
export declare function validateMediaFile(filePath: string, mimeType: string): Promise<{
    valid: boolean;
    error?: string;
}>;
/**
 * Check S3 connectivity and bucket permissions
 */
export declare function checkS3Connection(): Promise<boolean>;
//# sourceMappingURL=s3-media.service.d.ts.map
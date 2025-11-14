import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

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
export async function downloadAndUploadMedia(
  telnyxMediaUrl: string,
  conversationId: string,
  fileName: string
): Promise<{
  s3Key: string;
  s3Url: string;
  metadata: MediaMetadata;
}> {
  let tempFilePath: string | null = null;

  try {
    // 1. Download from Telnyx CDN
    console.log(`⬇️ Downloading media from Telnyx: ${telnyxMediaUrl}`);
    const response = await fetch(telnyxMediaUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download from Telnyx: ${response.statusText}`
      );
    }

    // 2. Get buffer
    const buffer = await response.buffer() as Buffer;

    // 3. Save to temp file for metadata extraction
    tempFilePath = path.join(
      process.cwd(),
      'temp',
      `${uuidv4()}_${fileName}`
    );
    const tempDir = path.dirname(tempFilePath);

    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(tempFilePath, buffer);

    console.log(`📝 Temp file: ${tempFilePath} (${buffer.length} bytes)`);

    // 4. Extract metadata without modifying file
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const metadata = await extractMediaMetadata(tempFilePath, contentType);

    // 5. Validate size
    const maxSize = parseInt(
      process.env.MAX_MEDIA_SIZE_BYTES || '524288000'
    ); // 500MB default
    if (buffer.length > maxSize) {
      throw new Error(
        `File too large: ${(buffer.length / 1024 / 1024).toFixed(1)}MB (max ${(
          maxSize /
          1024 /
          1024
        ).toFixed(1)}MB)`
      );
    }

    // 6. Upload to S3 - FULL QUALITY, NO COMPRESSION
    const s3Key = `${process.env.AWS_S3_FOLDER || 'conversations'}/${conversationId}/${uuidv4()}_${fileName}`;

    console.log(`📤 Uploading to S3: ${s3Key}`);

    await s3
      .putObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
        Body: buffer,
        ContentType: metadata.mimeType,
        ServerSideEncryption: 'AES256',
        Metadata: {
          'original-filename': fileName,
          'conversation-id': conversationId,
          'upload-date': new Date().toISOString(),
        },
      })
      .promise();

    console.log(`✅ S3 upload complete: ${s3Key}`);

    // 7. Generate presigned URL (valid for 7 days)
    const s3Url = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      Expires: 7 * 24 * 60 * 60,
    });

    return {
      s3Key,
      s3Url,
      metadata,
    };
  } catch (error: any) {
    console.error('❌ Media download/upload error:', error);
    throw new Error(`Failed to process media: ${error.message}`);
  } finally {
    // Cleanup temp file
    if (tempFilePath) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`🧹 Cleaned up temp file: ${tempFilePath}`);
      } catch (e) {
        console.warn(`Could not clean up temp file: ${tempFilePath}`);
      }
    }
  }
}

/**
 * Upload media file from dashboard (leader upload)
 * Called when leader clicks [📎] and selects file
 * NO COMPRESSION - stores full quality
 */
export async function uploadMediaFromFile(
  filePath: string,
  conversationId: string,
  fileName: string,
  mimeType: string
): Promise<{
  s3Key: string;
  s3Url: string;
  metadata: MediaMetadata;
}> {
  try {
    // 1. Read file
    const buffer = fs.readFileSync(filePath);

    // 2. Validate size
    const maxSize = parseInt(
      process.env.MAX_MEDIA_SIZE_BYTES || '524288000'
    );
    if (buffer.length > maxSize) {
      throw new Error(
        `File too large: ${(buffer.length / 1024 / 1024).toFixed(1)}MB (max ${(
          maxSize /
          1024 /
          1024
        ).toFixed(1)}MB)`
      );
    }

    // 3. Extract metadata (no modification)
    const metadata = await extractMediaMetadata(filePath, mimeType);

    // 4. Upload to S3 - FULL QUALITY, NO COMPRESSION
    const s3Key = `${process.env.AWS_S3_FOLDER || 'conversations'}/${conversationId}/${uuidv4()}_${fileName}`;

    console.log(`📤 Dashboard upload to S3: ${s3Key}`);

    await s3
      .putObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
        Body: buffer,
        ContentType: mimeType,
        ServerSideEncryption: 'AES256',
        Metadata: {
          'original-filename': fileName,
          'conversation-id': conversationId,
          'upload-date': new Date().toISOString(),
        },
      })
      .promise();

    console.log(`✅ Dashboard upload complete: ${s3Key}`);

    // 5. Generate presigned URL
    const s3Url = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      Expires: 7 * 24 * 60 * 60,
    });

    return {
      s3Key,
      s3Url,
      metadata,
    };
  } catch (error: any) {
    console.error('❌ File upload error:', error);
    throw new Error(`Failed to upload media: ${error.message}`);
  }
}

/**
 * Extract media metadata WITHOUT modifying the file
 * - Image dimensions
 * - Video/audio duration
 * - MIME type
 */
async function extractMediaMetadata(
  filePath: string,
  mimeType: string
): Promise<MediaMetadata> {
  const buffer = fs.readFileSync(filePath);

  // Determine media type
  let type: 'image' | 'video' | 'audio' | 'document';
  if (mimeType.startsWith('image/')) {
    type = 'image';
  } else if (mimeType.startsWith('video/')) {
    type = 'video';
  } else if (mimeType.startsWith('audio/')) {
    type = 'audio';
  } else {
    type = 'document';
  }

  const metadata: MediaMetadata = {
    type,
    sizeBytes: buffer.length,
    mimeType,
  };

  // Extract dimensions for images (using sharp - no modification)
  if (type === 'image') {
    try {
      const imgMetadata = await sharp(filePath, { failOnError: false }).metadata();
      metadata.width = imgMetadata.width;
      metadata.height = imgMetadata.height;
      console.log(
        `  📷 Image: ${imgMetadata.width}x${imgMetadata.height} (${imgMetadata.format})`
      );
    } catch (e) {
      console.warn('  ⚠️ Could not extract image dimensions');
    }
  }

  // Extract duration for video/audio (using ffprobe)
  if (type === 'video' || type === 'audio') {
    try {
      const ffprobe = require('ffprobe-static');
      const { execSync } = require('child_process');

      const command = `"${ffprobe.path}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:noescape=1 "${filePath}"`;
      const output = execSync(command, { encoding: 'utf-8' }).trim();
      const duration = parseFloat(output);

      if (!isNaN(duration)) {
        metadata.duration = Math.round(duration);
        const mins = Math.floor(duration / 60);
        const secs = Math.round(duration % 60);
        console.log(
          `  🎬 ${type}: ${mins}:${secs.toString().padStart(2, '0')}`
        );
      }
    } catch (e) {
      console.warn(
        `  ⚠️ Could not extract ${type} duration (ffprobe may not be installed)`
      );
    }
  }

  return metadata;
}

/**
 * Delete media from S3
 * Called when conversation is deleted or admin removes media
 */
export async function deleteMedia(s3Key: string): Promise<void> {
  try {
    await s3
      .deleteObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
      })
      .promise();

    console.log(`🗑️ Deleted from S3: ${s3Key}`);
  } catch (error: any) {
    console.error(`❌ Failed to delete ${s3Key}:`, error);
    // Don't throw - deletion failure shouldn't break flow
  }
}

/**
 * Refresh/generate presigned URL for existing media
 * Called when existing URL is about to expire
 */
export function getPresignedUrl(s3Key: string, expirationSeconds: number = 604800): string {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: s3Key,
    Expires: expirationSeconds, // 7 days default
  });
}

/**
 * Get media info (for dashboard preview)
 */
export async function getMediaInfo(s3Key: string): Promise<{
  url: string;
  size: number;
  lastModified: Date;
}> {
  try {
    const result = await s3
      .headObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
      })
      .promise();

    return {
      url: getPresignedUrl(s3Key),
      size: result.ContentLength || 0,
      lastModified: result.LastModified || new Date(),
    };
  } catch (error: any) {
    throw new Error(`Failed to get media info: ${error.message}`);
  }
}

/**
 * Cleanup old media based on retention policy
 * Run daily via cron job or Lambda
 */
export async function deleteOldMedia(
  retentionDays: number = 365
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  try {
    console.log(`🗓️ Cleaning up media older than ${retentionDays} days...`);

    let deletedCount = 0;
    let continuationToken: string | undefined;

    do {
      const listResult = await s3
        .listObjectsV2({
          Bucket: process.env.AWS_S3_BUCKET!,
          Prefix: process.env.AWS_S3_FOLDER!,
          ContinuationToken: continuationToken,
        })
        .promise();

      if (!listResult.Contents || listResult.Contents.length === 0) {
        break;
      }

      const oldObjects = listResult.Contents.filter(
        (obj) => obj.LastModified && obj.LastModified < cutoffDate
      );

      for (const obj of oldObjects) {
        if (obj.Key) {
          await deleteMedia(obj.Key);
          deletedCount++;
        }
      }

      continuationToken = listResult.NextContinuationToken;
    } while (continuationToken);

    console.log(`✅ Deleted ${deletedCount} old media files`);
    return deletedCount;
  } catch (error: any) {
    console.error('❌ Error during old media cleanup:', error);
    return 0;
  }
}

/**
 * Validate media file for upload
 */
export async function validateMediaFile(
  filePath: string,
  mimeType: string
): Promise<{ valid: boolean; error?: string }> {
  const maxSize = parseInt(process.env.MAX_MEDIA_SIZE_BYTES || '524288000');
  const stats = fs.statSync(filePath);

  if (stats.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Max ${(maxSize / 1024 / 1024).toFixed(1)}MB, got ${(
        stats.size /
        1024 /
        1024
      ).toFixed(1)}MB`,
    };
  }

  const allowedMimes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Videos
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/aac',
    'audio/ogg',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (!allowedMimes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type not allowed: ${mimeType}`,
    };
  }

  return { valid: true };
}

/**
 * Check S3 connectivity and bucket permissions
 */
export async function checkS3Connection(): Promise<boolean> {
  try {
    await s3
      .headBucket({ Bucket: process.env.AWS_S3_BUCKET! })
      .promise();
    console.log('✅ S3 bucket accessible');
    return true;
  } catch (error: any) {
    console.error('❌ S3 bucket not accessible:', error.message);
    return false;
  }
}

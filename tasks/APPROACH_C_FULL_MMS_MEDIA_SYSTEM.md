# Approach C: Full Two-Way MMS Media System with AWS S3
## Full Quality, No Compression, Complete Two-Way Communication

**Objective:** Enable congregation members to send media (photos, videos, audio, documents) via MMS to church's Telnyx number, with leaders able to reply with media from dashboard. All stored at full quality in AWS S3.

---

## SYSTEM OVERVIEW

```
CONGREGATION MEMBER                    CHURCH LEADER
     │                                      │
     ├─ Text message                        │
     │  └─ SMS received in dashboard        │
     │                                      │
     ├─ Photo/Video via MMS                 │
     │  └─ Received at full quality         │
     │     Stored in S3                     │
     │     Shown in conversation            │
     │                                      │
     │                            ┌─────────┴─────────┐
     │                            │                   │
     │                     Reply with text      Reply with media
     │                            │                   │
     │                    SMS via Telnyx      MMS via Telnyx
     │                            │                   │
     │  Receives text          ◄──┴───────────────────┤
     │  or                                            │
     │  Receives MMS (full quality)  ◄────────────────┘
     │
     └─ Takes new photo
        └─ Sends via MMS again
           └─ Cycle continues
```

---

## PART 1: AWS S3 SETUP

### Prerequisites
- AWS Account (free tier available)
- IAM user with S3 permissions
- S3 bucket created

### Create S3 Bucket

**In AWS Console:**

1. **Create bucket:**
   - Name: `koinonia-media-conversations` (must be globally unique)
   - Region: Choose closest to you (e.g., `us-east-1`)
   - Block public access: ON (private bucket)
   - Enable versioning: ON (for recovery)
   - Enable encryption: ON (SSE-S3)

2. **Create IAM user:**
   - User name: `koinonia-app`
   - Permissions: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
   - Restrict to bucket: `arn:aws:s3:::koinonia-media-conversations/*`
   - Generate access key + secret key

3. **Get credentials:**
   - Access Key ID
   - Secret Access Key
   - Save to `.env`

### Environment Variables

**File:** `backend/.env`

```env
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=koinonia-media-conversations
AWS_S3_FOLDER=conversations

# Media settings
MAX_MEDIA_SIZE_BYTES=524288000  # 500MB
MEDIA_RETENTION_DAYS=365        # Keep for 1 year
```

---

## PART 2: DATABASE SCHEMA

### Update `ConversationMessage` Model

**File:** `backend/prisma/schema.prisma`

```prisma
model ConversationMessage {
  id              String   @id @default(cuid())
  conversationId  String
  memberId        String
  content         String   // Text content (can be empty if media-only)
  direction       String   // "inbound" (from member) | "outbound" (from leader)

  // Telnyx tracking
  providerMessageId String?  // Telnyx MMS ID for delivery tracking
  deliveryStatus  String?    // "pending" | "delivered" | "failed"

  // NEW - Media attachment (S3 stored, full quality)
  mediaUrl        String?    // S3 presigned URL (expires in 7 days)
  mediaType       String?    // "image" | "video" | "audio" | "document"
  mediaName       String?    // Original filename (e.g., "photo.jpg")
  mediaSizeBytes  Int?       // File size in bytes
  mediaS3Key      String?    // S3 object key (e.g., "conversations/abc123/photo.jpg")
  mediaMimeType   String?    // MIME type (e.g., "image/jpeg")
  mediaWidth      Int?       // Image width (for preview)
  mediaHeight     Int?       // Image height (for preview)
  mediaDuration   Int?       // Video/audio duration in seconds

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  member          Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@index([createdAt])
  @@index([direction])
  @@index([mediaType])
}
```

### Migration

```bash
cd backend
npx prisma migrate dev --name add_media_fields_s3
npx prisma generate
```

---

## PART 3: BACKEND - S3 MEDIA SERVICE

### Create: `backend/src/services/s3-media.service.ts`

```typescript
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
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
 * Called when MMS is received
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
    console.log(`Downloading media from Telnyx: ${telnyxMediaUrl}`);
    const response = await fetch(telnyxMediaUrl);

    if (!response.ok) {
      throw new Error(`Failed to download from Telnyx: ${response.statusText}`);
    }

    // 2. Save to temp file
    const buffer = await response.buffer();
    tempFilePath = path.join(process.cwd(), 'temp', `${uuidv4()}_${fileName}`);

    fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    fs.writeFileSync(tempFilePath, buffer);

    // 3. Extract metadata
    const metadata = await extractMediaMetadata(tempFilePath, response.headers.get('content-type') || '');

    // 4. Validate size
    const maxSize = parseInt(process.env.MAX_MEDIA_SIZE_BYTES || '524288000');
    if (buffer.length > maxSize) {
      throw new Error(
        `File too large: ${(buffer.length / 1024 / 1024).toFixed(1)}MB (max ${(maxSize / 1024 / 1024).toFixed(1)}MB)`
      );
    }

    // 5. Upload to S3 (NO COMPRESSION)
    const s3Key = `${process.env.AWS_S3_FOLDER}/${conversationId}/${uuidv4()}_${fileName}`;

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

    console.log(`✅ Uploaded to S3: ${s3Key}`);

    // 6. Generate presigned URL (valid for 7 days)
    const s3Url = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      Expires: 7 * 24 * 60 * 60, // 7 days
    });

    return {
      s3Key,
      s3Url,
      metadata,
    };
  } catch (error: any) {
    console.error('Media download/upload error:', error);
    throw new Error(`Failed to process media: ${error.message}`);
  } finally {
    // Cleanup temp file
    if (tempFilePath) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Upload media file from dashboard (leader upload)
 * Called when leader clicks [📎] and selects file
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
    const maxSize = parseInt(process.env.MAX_MEDIA_SIZE_BYTES || '524288000');
    if (buffer.length > maxSize) {
      throw new Error(
        `File too large: ${(buffer.length / 1024 / 1024).toFixed(1)}MB (max ${(maxSize / 1024 / 1024).toFixed(1)}MB)`
      );
    }

    // 3. Extract metadata
    const metadata = await extractMediaMetadata(filePath, mimeType);

    // 4. Upload to S3 (NO COMPRESSION - FULL QUALITY)
    const s3Key = `${process.env.AWS_S3_FOLDER}/${conversationId}/${uuidv4()}_${fileName}`;

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

    console.log(`✅ Dashboard upload to S3: ${s3Key}`);

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
    console.error('File upload error:', error);
    throw new Error(`Failed to upload media: ${error.message}`);
  }
}

/**
 * Extract media metadata (dimensions, duration, etc)
 * NO compression - just reading metadata
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

  // Extract dimensions for images
  if (type === 'image') {
    try {
      const imgMetadata = await sharp(filePath).metadata();
      metadata.width = imgMetadata.width;
      metadata.height = imgMetadata.height;
    } catch (e) {
      console.warn('Could not extract image dimensions');
    }
  }

  // Extract duration for video/audio
  if (type === 'video' || type === 'audio') {
    try {
      const info = await ffprobe(filePath, { path: ffprobeStatic.path });
      const duration = info.streams[0]?.duration;
      if (duration) {
        metadata.duration = Math.round(parseFloat(duration));
      }
    } catch (e) {
      console.warn('Could not extract video/audio duration');
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

    console.log(`✅ Deleted from S3: ${s3Key}`);
  } catch (error: any) {
    console.error(`Failed to delete ${s3Key}:`, error);
    // Don't throw - deletion failure shouldn't break flow
  }
}

/**
 * Refresh presigned URL for existing media
 * Called when existing URL is about to expire
 */
export function getPresignedUrl(s3Key: string): string {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: s3Key,
    Expires: 7 * 24 * 60 * 60, // 7 days
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
export async function deleteOldMedia(retentionDays: number = 365): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  try {
    const listResult = await s3
      .listObjectsV2({
        Bucket: process.env.AWS_S3_BUCKET!,
        Prefix: process.env.AWS_S3_FOLDER!,
      })
      .promise();

    if (!listResult.Contents) return;

    const oldObjects = listResult.Contents.filter(
      (obj) => obj.LastModified && obj.LastModified < cutoffDate
    );

    if (oldObjects.length === 0) {
      console.log('No old media to delete');
      return;
    }

    for (const obj of oldObjects) {
      await deleteMedia(obj.Key!);
      console.log(`🗑️ Deleted old media: ${obj.Key}`);
    }
  } catch (error: any) {
    console.error('Error during old media cleanup:', error);
  }
}
```

### Install Dependencies

```bash
cd backend
npm install aws-sdk uuid ffprobe ffprobe-static sharp node-fetch
npm install --save-dev @types/uuid
```

---

## PART 4: TELNYX MMS SERVICE

### Create/Update: `backend/src/services/telnyx-mms.service.ts`

```typescript
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import * as s3MediaService from './s3-media.service.js';

const prisma = new PrismaClient();
const TELNYX_BASE_URL = 'https://api.telnyx.com/v2';

function getTelnyxClient() {
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) {
    throw new Error('TELNYX_API_KEY not configured');
  }

  return axios.create({
    baseURL: TELNYX_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Send MMS (SMS with media attachment)
 * Used for leader replies with media
 */
export async function sendMMS(
  to: string,
  message: string,
  churchId: string,
  mediaS3Url?: string
): Promise<{ messageSid: string; success: boolean }> {
  // Get church Telnyx number
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { telnyxPhoneNumber: true },
  });

  if (!church?.telnyxPhoneNumber) {
    throw new Error('Telnyx phone number not configured for this church');
  }

  try {
    const client = getTelnyxClient();

    // Build payload
    const payload: any = {
      from: church.telnyxPhoneNumber,
      to,
      text: message,
      type: 'MMS',
      webhook_url: `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/status`,
      webhook_failover_url: `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/status`,
    };

    // Add media URL if provided
    if (mediaS3Url) {
      payload.media_urls = [mediaS3Url];
    }

    // Send via Telnyx
    const response = await client.post('/messages', payload);

    const messageId = response.data?.data?.id;
    if (!messageId) {
      throw new Error('No message ID returned from Telnyx');
    }

    console.log(`✅ MMS sent: ${messageId} to ${to}`);

    return {
      messageSid: messageId,
      success: true,
    };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.errors?.[0]?.detail ||
      error.message ||
      'Failed to send MMS';
    throw new Error(`Telnyx MMS error: ${errorMessage}`);
  }
}

/**
 * Handle inbound MMS webhook
 * Called when member sends photo/video/audio to church number
 */
export async function handleInboundMMS(
  churchId: string,
  senderPhone: string,
  messageText: string,
  mediaUrls: string[]
): Promise<{
  conversationId: string;
  messageIds: string[];
}> {
  try {
    // 1. Find or create member by phone
    let member = await prisma.member.findFirst({
      where: {
        groups: {
          some: {
            group: { churchId },
          },
        },
        phoneHash: hashPhone(senderPhone),
      },
    });

    if (!member) {
      // Create new member for unknown caller
      member = await prisma.member.create({
        data: {
          firstName: '',
          lastName: 'Congregation Member',
          phone: senderPhone, // Will be encrypted
          phoneHash: hashPhone(senderPhone),
          optInSms: true,
        },
      });

      console.log(`📱 Created new member for: ${senderPhone}`);
    }

    // 2. Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        churchId,
        memberId: member.id,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          churchId,
          memberId: member.id,
          lastMessageAt: new Date(),
        },
      });

      console.log(`💬 Created new conversation: ${conversation.id}`);
    }

    // 3. Create message record for text (if any)
    const messageIds: string[] = [];

    if (messageText) {
      const textMessage = await prisma.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          memberId: member.id,
          content: messageText,
          direction: 'inbound',
        },
      });

      messageIds.push(textMessage.id);
      console.log(`📝 Created text message: ${textMessage.id}`);
    }

    // 4. Process each media attachment
    for (const mediaUrl of mediaUrls) {
      try {
        console.log(`⬇️ Processing media from Telnyx: ${mediaUrl}`);

        // Extract filename from URL
        const fileName = mediaUrl.split('/').pop() || `media_${Date.now()}`;

        // Download from Telnyx and upload to S3
        const uploadResult = await s3MediaService.downloadAndUploadMedia(
          mediaUrl,
          conversation.id,
          fileName
        );

        // Create message record for media
        const mediaMessage = await prisma.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            memberId: member.id,
            content: messageText || `[${uploadResult.metadata.type}]`,
            direction: 'inbound',
            mediaUrl: uploadResult.s3Url,
            mediaType: uploadResult.metadata.type,
            mediaName: fileName,
            mediaSizeBytes: uploadResult.metadata.sizeBytes,
            mediaS3Key: uploadResult.s3Key,
            mediaMimeType: uploadResult.metadata.mimeType,
            mediaWidth: uploadResult.metadata.width,
            mediaHeight: uploadResult.metadata.height,
            mediaDuration: uploadResult.metadata.duration,
          },
        });

        messageIds.push(mediaMessage.id);
        console.log(`🖼️ Created media message: ${mediaMessage.id}`);
      } catch (error: any) {
        console.error(`Failed to process media: ${error.message}`);
        // Continue with next media instead of failing entire webhook
      }
    }

    // 5. Update conversation last message time
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    console.log(`✅ Inbound MMS processed: ${conversation.id}`);

    return {
      conversationId: conversation.id,
      messageIds,
    };
  } catch (error: any) {
    console.error('Inbound MMS handling error:', error);
    throw error;
  }
}

/**
 * Hash phone number for secure lookup
 */
function hashPhone(phone: string): string {
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', process.env.PHONE_HASH_KEY || 'default')
    .update(phone)
    .digest('hex');
}
```

---

## PART 5: CONVERSATION CONTROLLER UPDATES

### Update: `backend/src/controllers/conversation.controller.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import * as telnyxMMSService from '../services/telnyx-mms.service.js';
import * as s3MediaService from '../services/s3-media.service.js';

const prisma = new PrismaClient();

/**
 * POST /api/conversations/:conversationId/reply
 * Send text-only reply
 */
export async function replyToConversation(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const churchId = req.user?.churchId;

    if (!churchId || !conversationId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Verify conversation belongs to church
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { church: true, member: true },
    });

    if (!conversation || conversation.churchId !== churchId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Create outbound message
    const message = await prisma.conversationMessage.create({
      data: {
        conversationId,
        memberId: conversation.member.id,
        content,
        direction: 'outbound',
      },
    });

    // Queue MMS send
    await prisma.messageQueue.create({
      data: {
        phone: conversation.member.phone,
        churchId,
        content,
        conversationMessageId: message.id,
        status: 'pending',
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        direction: message.direction,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/conversations/:conversationId/reply-with-media
 * Send text reply with media attachment
 */
export async function replyWithMedia(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const churchId = req.user?.churchId;

    if (!churchId || !conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Verify file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Verify conversation belongs to church
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { church: true, member: true },
    });

    if (!conversation || conversation.churchId !== churchId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Upload media to S3 (full quality, no compression)
    const uploadResult = await s3MediaService.uploadMediaFromFile(
      req.file.path,
      conversationId,
      req.file.originalname,
      req.file.mimetype
    );

    // Create outbound message with media
    const message = await prisma.conversationMessage.create({
      data: {
        conversationId,
        memberId: conversation.member.id,
        content: content || `[${uploadResult.metadata.type}]`,
        direction: 'outbound',
        mediaUrl: uploadResult.s3Url,
        mediaType: uploadResult.metadata.type,
        mediaName: req.file.originalname,
        mediaSizeBytes: uploadResult.metadata.sizeBytes,
        mediaS3Key: uploadResult.s3Key,
        mediaMimeType: uploadResult.metadata.mimeType,
        mediaWidth: uploadResult.metadata.width,
        mediaHeight: uploadResult.metadata.height,
        mediaDuration: uploadResult.metadata.duration,
      },
    });

    // Queue MMS send with media
    await prisma.messageQueue.create({
      data: {
        phone: conversation.member.phone,
        churchId,
        content: content || `[${uploadResult.metadata.type}]`,
        mediaS3Url: uploadResult.s3Url,
        conversationMessageId: message.id,
        status: 'pending',
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        mediaSizeBytes: message.mediaSizeBytes,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error('Reply with media error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/webhooks/telnyx/mms
 * Receive inbound MMS from member
 */
export async function handleTelnyxInboundMMS(req: Request, res: Response) {
  try {
    const { type, data } = req.body;

    // Only process message received events
    if (type !== 'message.received') {
      return res.status(200).json({ received: true });
    }

    const payload = data?.payload?.[0];
    if (!payload) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { from, to, text, media } = payload;

    // Find church by Telnyx number (to field)
    const church = await prisma.church.findFirst({
      where: { telnyxPhoneNumber: to },
    });

    if (!church) {
      console.log(`❌ No church found for Telnyx number: ${to}`);
      return res.status(200).json({ received: true }); // Still acknowledge webhook
    }

    // Extract media URLs
    const mediaUrls = media?.map((m: any) => m.url) || [];

    // Process inbound MMS
    const result = await telnyxMMSService.handleInboundMMS(
      church.id,
      from,
      text || '',
      mediaUrls
    );

    console.log(`✅ Inbound MMS processed: ${result.conversationId}`);

    return res.json({ received: true });
  } catch (error) {
    console.error('Inbound MMS webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}
```

---

## PART 6: MESSAGE QUEUE JOB PROCESSOR

### Update: `backend/src/jobs/queue.ts`

**Add MMS job processor:**

```typescript
import Bull from 'bull';
import * as telnyxMMSService from '../services/telnyx-mms.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const smsQueue = new Bull('sms', redisUrl);
export const mmsQueue = new Bull('mms', redisUrl); // NEW

// MMS Job Processor
mmsQueue.process(async (job) => {
  const {
    phone,
    churchId,
    content,
    mediaS3Url,
    conversationMessageId,
  } = job.data;

  try {
    console.log(`📤 Sending MMS to ${phone}...`);

    // Send via Telnyx
    const result = await telnyxMMSService.sendMMS(
      phone,
      content,
      churchId,
      mediaS3Url // Full S3 URL, no compression
    );

    // Update message with Telnyx ID
    if (conversationMessageId) {
      await prisma.conversationMessage.update({
        where: { id: conversationMessageId },
        data: {
          providerMessageId: result.messageSid,
          deliveryStatus: 'pending',
        },
      });
    }

    console.log(`✅ MMS job completed: ${result.messageSid}`);
    return { success: true, messageSid: result.messageSid };
  } catch (error: any) {
    console.error(`❌ MMS job failed: ${error.message}`);
    throw error;
  }
});

mmsQueue.on('completed', (job) => {
  console.log(`✅ MMS job ${job.id} completed`);
});

mmsQueue.on('failed', (job, error) => {
  console.error(`❌ MMS job ${job.id} failed: ${error.message}`);
});

export async function closeQueues() {
  await Promise.all([
    smsQueue.close(),
    mmsQueue.close(),
  ]);
  console.log('✅ All queues closed');
}
```

---

## PART 7: ROUTES

### Update: `backend/src/routes/message.routes.ts`

```typescript
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as conversationController from '../controllers/conversation.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Multer config for media uploads
const upload = multer({
  dest: path.join(process.cwd(), 'temp'),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
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
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/aac',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    } else {
      cb(null, true);
    }
  },
});

// Existing routes
router.post('/send', authMiddleware, conversationController.sendMessage);
router.get('/:messageId', authMiddleware, conversationController.getMessageDetails);

// Conversation routes
router.get('/conversations', authMiddleware, conversationController.getConversations);
router.get('/conversations/:conversationId', authMiddleware, conversationController.getConversation);

// Reply routes
router.post('/conversations/:conversationId/reply', authMiddleware, conversationController.replyToConversation);
router.post(
  '/conversations/:conversationId/reply-with-media',
  authMiddleware,
  upload.single('file'),
  conversationController.replyWithMedia
);

// Mark as read
router.patch('/conversations/:conversationId/read', authMiddleware, conversationController.markAsRead);

// Webhooks
router.post('/webhooks/telnyx/status', conversationController.handleTelnyxWebhook);
router.post('/webhooks/telnyx/mms', conversationController.handleTelnyxInboundMMS); // NEW

export default router;
```

---

## PART 8: FRONTEND - MESSAGE THREAD WITH MEDIA

### Update: `frontend/src/components/conversations/MessageBubble.tsx`

```typescript
import React from 'react';
import { Download, Play } from 'lucide-react';

interface ConversationMessage {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  mediaName?: string;
  mediaSizeBytes?: number;
  mediaDuration?: number;
  createdAt: Date;
  member: {
    firstName: string;
    lastName: string;
  };
}

export function MessageBubble({ message }: { message: ConversationMessage }) {
  const isOutbound = message.direction === 'outbound';
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / 1024 / 1024;
    return mb > 1 ? `${mb.toFixed(1)}MB` : `${(bytes / 1024).toFixed(0)}KB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-sm rounded-lg p-3 ${
          isOutbound ? 'bg-primary text-white' : 'bg-muted text-foreground'
        }`}
      >
        {/* Media attachment with full quality display */}
        {message.mediaUrl && (
          <div className="mb-2">
            {message.mediaType === 'image' && (
              <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={message.mediaUrl}
                  alt="Media"
                  className="max-w-xs rounded-lg hover:opacity-90 cursor-pointer"
                />
              </a>
            )}

            {message.mediaType === 'video' && (
              <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer">
                <video
                  className="max-w-xs rounded-lg"
                  controls
                  poster={message.mediaUrl}
                >
                  <source src={message.mediaUrl} />
                </video>
              </a>
            )}

            {message.mediaType === 'audio' && (
              <audio controls className="max-w-xs rounded-lg">
                <source src={message.mediaUrl} />
              </audio>
            )}

            {message.mediaType === 'document' && (
              <a
                href={message.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-background/20 rounded-lg hover:bg-background/40"
              >
                <span>📄</span>
                <div>
                  <p className="text-sm font-medium">{message.mediaName}</p>
                  <p className="text-xs opacity-75">
                    {formatFileSize(message.mediaSizeBytes)}
                  </p>
                </div>
                <Download size={16} className="ml-auto" />
              </a>
            )}
          </div>
        )}

        {/* Text content */}
        {message.content && !message.content.startsWith('[') && (
          <p className="text-sm break-words">{message.content}</p>
        )}

        {/* Timestamp */}
        <p
          className={`text-xs mt-1 ${
            isOutbound ? 'text-white/80' : 'text-muted-foreground'
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
```

### Update: `frontend/src/components/conversations/ReplyComposer.tsx`

```typescript
import React, { useState, useRef } from 'react';
import { Button, Input, Spinner } from '@nextui-org/react';
import { Send, Paperclip, X } from 'lucide-react';

interface ReplyComposerProps {
  conversationId: string;
  onReply: (message: string) => void;
  isLoading?: boolean;
}

export function ReplyComposer({
  conversationId,
  onReply,
  isLoading,
}: ReplyComposerProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(
        `File too large. Max 500MB, got ${(file.size / 1024 / 1024).toFixed(1)}MB`
      );
      return;
    }

    setSelectedFile(file);

    // Show image preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSend = async () => {
    if (!message && !selectedFile) return;

    if (selectedFile) {
      // Send with media
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (message) {
          formData.append('content', message);
        }

        const response = await fetch(
          `/api/conversations/${conversationId}/reply-with-media`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        // Clear state
        setMessage('');
        setSelectedFile(null);
        setFilePreview(null);
        onReply('');
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to send media');
      } finally {
        setUploading(false);
      }
    } else {
      // Send text only
      onReply(message);
      setMessage('');
    }
  };

  return (
    <div className="bg-card border-t border-border p-4">
      {/* File preview */}
      {filePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={filePreview}
            alt="Preview"
            className="max-h-40 rounded-lg border border-border"
          />
          <button
            onClick={() => {
              setSelectedFile(null);
              setFilePreview(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* File name for non-image files */}
      {selectedFile && !filePreview && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-muted rounded-lg">
          <Paperclip size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground flex-1">{selectedFile.name}</span>
          <button
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="text-red-500 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 items-end">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
        />

        <Button
          isIconOnly
          variant="light"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isLoading}
          className="text-primary"
        >
          <Paperclip size={20} />
        </Button>

        <Input
          placeholder={
            selectedFile
              ? 'Add a caption (optional)...'
              : 'Type a message...'
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={uploading || isLoading}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          size="lg"
          className="flex-1"
        />

        <Button
          isIconOnly
          color="primary"
          onClick={handleSend}
          disabled={!message && !selectedFile}
          isLoading={uploading || isLoading}
        >
          {uploading || isLoading ? <Spinner size="sm" /> : <Send size={20} />}
        </Button>
      </div>

      {/* File size warning */}
      {selectedFile && (
        <p className="text-xs text-muted-foreground mt-2">
          {(selectedFile.size / 1024 / 1024).toFixed(1)}MB • Will be sent at full quality
        </p>
      )}
    </div>
  );
}
```

---

## PART 9: TELNYX WEBHOOK CONFIGURATION

### In Telnyx Dashboard:

**1. Inbound SMS/MMS Webhook**
- Webhook URL: `https://api.koinoniasms.com/api/messages/webhooks/telnyx/mms`
- Events: `Message Received`
- Format: JSON
- HTTP Method: POST

**2. Outbound Delivery Status Webhook** (Already configured)
- Webhook URL: `https://api.koinoniasms.com/api/messages/webhooks/telnyx/status`
- Events: `Delivery Receipt`

---

## PART 10: DATABASE MIGRATION

```bash
cd backend

# Create migration
npx prisma migrate dev --name add_s3_media_support

# Generate Prisma client
npx prisma generate

# Verify with studio
npx prisma studio
```

---

## PART 11: ENVIRONMENT VARIABLES

### `backend/.env`

```env
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=koinonia-media-conversations
AWS_S3_FOLDER=conversations

# Media
MAX_MEDIA_SIZE_BYTES=524288000  # 500MB
MEDIA_RETENTION_DAYS=365         # 1 year

# Phone hash (for secure lookups)
PHONE_HASH_KEY=your_secret_key_here

# Existing variables
TELNYX_API_KEY=...
DATABASE_URL=...
REDIS_URL=...
```

---

## PART 12: DEPENDENCIES

```bash
cd backend
npm install aws-sdk uuid ffprobe ffprobe-static

cd ../frontend
# Already has @nextui-org/react and lucide-react
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Setup (Day 1 - 4 hours)
- [ ] Create AWS S3 bucket
- [ ] Get AWS credentials
- [ ] Update .env with S3 config
- [ ] Install dependencies
- [ ] Create s3-media.service.ts
- [ ] Test S3 connection

### Phase 2: Database (Day 1 - 2 hours)
- [ ] Update schema.prisma with media fields
- [ ] Run migration
- [ ] Verify with Prisma Studio
- [ ] Test schema

### Phase 3: Backend Services (Days 2-3 - 12 hours)
- [ ] Create/update telnyx-mms.service.ts
- [ ] Add MMS queue processor
- [ ] Create webhook handlers
- [ ] Update controllers
- [ ] Add routes
- [ ] Test with Postman

### Phase 4: Frontend (Days 3-4 - 10 hours)
- [ ] Update MessageBubble component
- [ ] Update ReplyComposer component
- [ ] Add media preview/display
- [ ] Test upload flow
- [ ] Test media display

### Phase 5: Integration (Day 5 - 4 hours)
- [ ] Configure Telnyx webhooks
- [ ] Send test SMS + MMS from phone
- [ ] Verify in dashboard
- [ ] Test reply with media
- [ ] Check S3 storage

### Phase 6: Testing (Day 6 - 4 hours)
- [ ] Load test with multiple files
- [ ] Test file size limits
- [ ] Test all media types
- [ ] Test delivery status
- [ ] Test retention policy

**Total: ~40 hours over 1 week**

---

## TESTING PLAN

### Test 1: Receive Photo MMS
```
1. Open Messages on phone
2. Text church's Telnyx number
3. Attach photo
4. Send
Expected:
  → Message received webhook
  → Photo downloaded from Telnyx
  → Uploaded to S3 (full quality)
  → Shown in dashboard conversation
```

### Test 2: Send Photo from Dashboard
```
1. Open conversation
2. Click [📎]
3. Select photo from computer
4. Write caption: "Thanks!"
5. Click [Send]
Expected:
  → Photo uploaded to S3
  → MMS queued
  → Telnyx sends MMS
  → Member receives photo at full quality
```

### Test 3: Video Support
```
1. Member sends video via MMS
2. Check dashboard
Expected:
  → Video shown with play button
  → Click to view
  → Full quality (no compression)
  → Duration shown
```

### Test 4: File Size
```
1. Try uploading 600MB file
Expected:
  → Error: "File too large (max 500MB)"
```

### Test 5: Document Support
```
1. Send PDF/Word/Excel
2. Check dashboard
Expected:
  → Document icon shown
  → Download link available
  → Full quality preserved
```

---

## COST ANALYSIS

### One-Time
- Development: 40 hours × $50 = $2,000

### Monthly
- AWS S3 storage: ~$0.30 (for ~100GB)
- AWS S3 transfer: ~$0.10 (downloads)
- Telnyx MMS: $0.05 per MMS (instead of $0.02 SMS)
- **Total:** ~$0.40 + Telnyx MMS costs

**Compared to Cloudinary approach:**
- Saves $99/month on Cloudinary
- Full quality instead of compressed
- No compression overhead

---

## SECURITY NOTES

✅ **Already Included:**
- JWT authentication on all endpoints
- Church ownership verification
- S3 bucket encryption (SSE-S3)
- Private bucket (no public access)
- Presigned URLs (7-day expiration)
- File type validation
- File size limits

⚠️ **To Add Later:**
- [ ] Telnyx webhook signature validation
- [ ] Rate limiting on upload/reply
- [ ] Audit logging for media access
- [ ] Media deletion after retention period
- [ ] Virus scanning for uploaded files

---

## SUCCESS CRITERIA

✅ **When Done, System Can:**
- Member sends photo via MMS → received at full quality
- Dashboard shows conversation with photo
- Leader replies with text → sent via SMS
- Leader replies with video → sent via MMS (full quality)
- Member receives video at full quality
- All media types supported (image, video, audio, document)
- No file compression ever
- Files stored securely in S3
- Old files auto-deleted after 1 year

---

**Ready to start implementation?**

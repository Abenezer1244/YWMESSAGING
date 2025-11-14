# PHASE 1: Media Sharing via SMS + Cloudinary Links
## Simple, Immediate, No Mobile App Required

**Objective:** Add image/document sharing to conversations via SMS-friendly Cloudinary links

---

## QUICK OVERVIEW

```
What Users Do:
┌──────────────────────────────────────────────────────┐
│ Leader in Dashboard:                                 │
│ 1. Open conversation with congregation/member       │
│ 2. Click [📎] to attach image                       │
│ 3. Upload from computer (auto-compressed)           │
│ 4. System shows preview thumbnail                   │
│ 5. Write caption: "Look at this!"                   │
│ 6. Click [Send]                                     │
│                                                      │
│ What Happens:                                       │
│ → Image uploaded to Cloudinary                      │
│ → Short link generated                             │
│ → SMS sent: "Look at this! View: koinoniasms..."   │
│ → Member clicks link → Views image in browser      │
└──────────────────────────────────────────────────────┘
```

---

## PART 1: DATABASE SCHEMA

### Add to `ConversationMessage` Model

**File:** `backend/prisma/schema.prisma`

```prisma
model ConversationMessage {
  id              String   @id @default(cuid())
  conversationId  String
  memberId        String
  content         String
  direction       String   // "inbound" | "outbound"

  // Telnyx tracking (existing)
  providerMessageId String?
  deliveryStatus  String?

  // NEW - Media attachment fields
  mediaUrl        String?    // Cloudinary URL with short link
  mediaType       String?    // "image" | "document"
  mediaName       String?    // Original filename
  mediaSizeBytes  Int?       // File size for display
  mediaCloudId    String?    // Cloudinary public ID (for deletion)

  createdAt       DateTime @default(now())

  // Relations
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  member          Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@index([createdAt])
  @@index([direction])
}
```

### Migration
```bash
# In backend directory
npx prisma migrate dev --name add_media_to_conversation_message
npx prisma generate
```

---

## PART 2: BACKEND - CLOUDINARY SERVICE

### Create: `backend/src/services/media.service.ts`

```typescript
import cloudinary from 'cloudinary';
import { v2 as cloudinaryv2 } from 'cloudinary';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary (credentials from .env)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface MediaUploadResult {
  url: string;           // Direct Cloudinary URL
  publicId: string;      // For deletion later
  type: 'image' | 'document';
  sizeBytes: number;
  width?: number;
  height?: number;
}

/**
 * Validate media file
 * - Max 5MB
 * - Allowed types: jpg, png, gif, pdf, docx, xlsx
 */
export async function validateMediaFile(
  file: Express.Multer.File
): Promise<{ valid: boolean; error?: string }> {
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Max 5MB, got ${(file.size / 1024 / 1024).toFixed(1)}MB`
    };
  }

  const allowedMimes = {
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'application/pdf': 'document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  };

  if (!Object.keys(allowedMimes).includes(file.mimetype)) {
    return {
      valid: false,
      error: `File type not allowed: ${file.mimetype}`
    };
  }

  return { valid: true };
}

/**
 * Compress image if needed
 * - Max 800x800 for thumbnails
 * - Max 80% quality to reduce size
 */
export async function compressImage(
  filePath: string
): Promise<Buffer> {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // If larger than 800px, resize
    if ((metadata.width || 0) > 800 || (metadata.height || 0) > 800) {
      return await image
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    }

    // Otherwise compress only
    return await sharp(filePath)
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (error) {
    console.error('Image compression error:', error);
    // Return original if compression fails
    return fs.readFileSync(filePath);
  }
}

/**
 * Upload media to Cloudinary
 * - Automatically compresses images
 * - Stores in folder: conversations/[conversationId]/
 * - Returns short URL
 */
export async function uploadMedia(
  filePath: string,
  conversationId: string,
  fileName: string,
  mimeType: string
): Promise<MediaUploadResult> {
  try {
    let fileBuffer = fs.readFileSync(filePath);

    // Compress images
    if (mimeType.startsWith('image/')) {
      fileBuffer = await compressImage(filePath);
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: `conversations/${conversationId}`,
          resource_type: 'auto',
          public_id: `${Date.now()}_${fileName.replace(/\s+/g, '_')}`,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });

    const uploadResult = result as any;

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      type: uploadResult.resource_type === 'image' ? 'image' : 'document',
      sizeBytes: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
    };
  } catch (error: any) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  } finally {
    // Clean up temp file
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Delete media from Cloudinary
 */
export async function deleteMedia(publicId: string): Promise<void> {
  try {
    await cloudinary.v2.uploader.destroy(publicId, {
      resource_type: 'auto',
    });
    console.log(`Deleted media: ${publicId}`);
  } catch (error: any) {
    console.error(`Failed to delete media ${publicId}:`, error.message);
    // Don't throw - deletion failure shouldn't break flow
  }
}
```

---

## PART 3: BACKEND - CONVERSATION MEDIA CONTROLLER

### Update: `backend/src/controllers/conversation.controller.ts`

**Add new function:**

```typescript
import { uploadMedia, validateMediaFile } from '../services/media.service.js';
import { PrismaClient } from '@prisma/client';
import * as conversationService from '../services/conversation.service.js';

const prisma = new PrismaClient();

/**
 * POST /api/conversations/:conversationId/media
 * Upload image/document with optional caption
 * Returns created message with media info
 */
export async function uploadMedia(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;
    const { caption } = req.body;
    const churchId = req.user?.churchId;
    const adminId = req.user?.id;

    if (!churchId || !conversationId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
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

    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Validate file
    const validation = await validateMediaFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Upload to Cloudinary
    const mediaResult = await uploadMedia(
      req.file.path,
      conversationId,
      req.file.originalname,
      req.file.mimetype
    );

    // Create conversation message with media
    const message = await prisma.conversationMessage.create({
      data: {
        conversationId,
        memberId: conversation.member.id,
        content: caption || `[${mediaResult.type}]`,
        direction: 'outbound',
        mediaUrl: mediaResult.url,
        mediaType: mediaResult.type,
        mediaName: req.file.originalname,
        mediaSizeBytes: mediaResult.sizeBytes,
        mediaCloudId: mediaResult.publicId,
      },
    });

    // Update conversation last message time
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Queue SMS if outbound and has caption
    if (caption) {
      // Send SMS with link
      const smsText = `${caption}\n\nView: ${mediaResult.url}`;

      await prisma.messageQueue.create({
        data: {
          phone: conversation.member.phone,
          churchId,
          content: smsText,
          conversationMessageId: message.id,
          status: 'pending',
        },
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * DELETE /api/conversations/:conversationId/messages/:messageId/media
 * Delete media attachment
 */
export async function deleteMediaAttachment(req: Request, res: Response) {
  try {
    const { conversationId, messageId } = req.params;
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Get message and verify ownership
    const message = await prisma.conversationMessage.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message || message.conversation.churchId !== churchId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    if (!message.mediaCloudId) {
      return res.status(400).json({
        success: false,
        error: 'No media to delete',
      });
    }

    // Delete from Cloudinary
    await deleteMedia(message.mediaCloudId);

    // Clear media fields
    await prisma.conversationMessage.update({
      where: { id: messageId },
      data: {
        mediaUrl: null,
        mediaType: null,
        mediaName: null,
        mediaSizeBytes: null,
        mediaCloudId: null,
      },
    });

    return res.json({
      success: true,
      message: 'Media deleted',
    });
  } catch (error) {
    console.error('Media deletion error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
}
```

### Add to Routes: `backend/src/routes/message.routes.ts`

```typescript
import multer from 'multer';
import path from 'path';

const upload = multer({
  dest: path.join(process.cwd(), 'temp'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Add routes
router.post(
  '/conversations/:conversationId/media',
  authMiddleware,
  upload.single('file'),
  conversation.uploadMedia
);

router.delete(
  '/conversations/:conversationId/messages/:messageId/media',
  authMiddleware,
  conversation.deleteMediaAttachment
);
```

---

## PART 4: FRONTEND - MEDIA UPLOAD UI

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

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(
        `File too large. Max 5MB, got ${(file.size / 1024 / 1024).toFixed(1)}MB`
      );
      return;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(`File type not allowed: ${file.type}`);
      return;
    }

    setSelectedFile(file);

    // Show preview for images
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

  // Upload media with caption
  const handleSendWithMedia = async () => {
    if (!selectedFile) {
      onReply(message);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (message) {
        formData.append('caption', message);
      }

      const response = await fetch(
        `/api/conversations/${conversationId}/media`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Clear state
      setMessage('');
      setSelectedFile(null);
      setFilePreview(null);
      onReply(''); // Trigger refresh
    } catch (error) {
      console.error('Media upload error:', error);
      alert('Failed to upload media');
    } finally {
      setUploading(false);
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
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* File name for documents */}
      {selectedFile && !filePreview && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-muted rounded-lg">
          <Paperclip size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground">{selectedFile.name}</span>
          <button
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="ml-auto text-red-500 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 items-end">
        {/* File input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept=".jpg,.jpeg,.png,.gif,.pdf,.docx,.xlsx"
        />

        {/* Attach button */}
        <Button
          isIconOnly
          variant="light"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isLoading}
          className="text-primary"
        >
          <Paperclip size={20} />
        </Button>

        {/* Message input */}
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
              handleSendWithMedia();
            }
          }}
          size="lg"
          className="flex-1"
        />

        {/* Send button */}
        <Button
          isIconOnly
          color="primary"
          onClick={handleSendWithMedia}
          disabled={!message && !selectedFile}
          isLoading={uploading || isLoading}
        >
          {uploading || isLoading ? <Spinner size="sm" /> : <Send size={20} />}
        </Button>
      </div>
    </div>
  );
}
```

### Update: `frontend/src/components/conversations/MessageThread.tsx`

```typescript
// Add this component to display media in messages

interface ConversationMessage {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  mediaUrl?: string;
  mediaType?: 'image' | 'document';
  mediaName?: string;
  createdAt: Date;
  member: {
    firstName: string;
    lastName: string;
  };
}

export function MessageBubble({ message }: { message: ConversationMessage }) {
  const isOutbound = message.direction === 'outbound';

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-sm rounded-lg p-3 ${
          isOutbound
            ? 'bg-primary text-white'
            : 'bg-muted text-foreground'
        }`}
      >
        {/* Media attachment */}
        {message.mediaUrl && (
          <div className="mb-2">
            {message.mediaType === 'image' ? (
              <a
                href={message.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={message.mediaUrl}
                  alt="Attachment"
                  className="max-w-xs rounded-lg hover:opacity-90"
                />
              </a>
            ) : (
              <a
                href={message.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <Paperclip size={16} />
                <span>{message.mediaName || 'Document'}</span>
              </a>
            )}
          </div>
        )}

        {/* Text content */}
        {message.content && (
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

---

## PART 5: ENVIRONMENT VARIABLES

### Update: `backend/.env`

```env
# Existing variables...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Get these from:** https://cloudinary.com/console/settings/api-keys

---

## PART 6: DEPENDENCIES

### Install Required Packages

**Backend:**
```bash
cd backend
npm install sharp multer
npm install --save-dev @types/multer
```

**Frontend:**
```bash
cd frontend
# Already has @nextui-org/react and lucide-react
```

---

## PART 7: SMS INTEGRATION

### How Media Gets Sent via SMS

**Flow:**
```
1. Leader uploads image with caption "Check this out!"
2. System creates ConversationMessage with:
   - mediaUrl: "https://cloudinary.com/img/abc123"
   - mediaType: "image"
   - content: "Check this out!"

3. If has caption, queue SMS:
   - Phone: congregation member's phone
   - Content: "Check this out!\n\nView: https://img.koinoniasms.com/abc123"
   - Length: ~80 chars + URL = 1-2 SMS segments

4. SMS sent via Telnyx

5. Member receives:
   "Check this out!
    View: https://img.koinoniasms.com/abc123"

6. Member clicks link → Sees image in browser
```

### Update: `backend/src/jobs/queue.ts`

Add SMS job processor that includes media URLs:

```typescript
smsQueue.process(async (job) => {
  const {
    phone,
    churchId,
    content,
    mediaUrl,
    conversationMessageId
  } = job.data;

  try {
    // If has media URL, append to content
    let smsContent = content;
    if (mediaUrl) {
      smsContent += `\n\nView: ${mediaUrl}`;
    }

    // Send via Telnyx
    const result = await telnyxService.sendSMS(
      phone,
      smsContent,
      churchId
    );

    // Update message with delivery ID
    if (conversationMessageId) {
      await prisma.conversationMessage.update({
        where: { id: conversationMessageId },
        data: {
          providerMessageId: result.messageSid,
          deliveryStatus: 'pending',
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('SMS job failed:', error);
    throw error;
  }
});
```

---

## IMPLEMENTATION CHECKLIST

### Database (2 hours)
- [ ] Add media fields to ConversationMessage schema
- [ ] Run `prisma migrate dev`
- [ ] Run `prisma generate`
- [ ] Test with `prisma studio`

### Backend Services (4 hours)
- [ ] Create `media.service.ts` with Cloudinary functions
- [ ] Add multer middleware to routes
- [ ] Create media upload controller
- [ ] Add media deletion endpoint
- [ ] Update SMS queue processor to include URLs
- [ ] Test with Postman

### Frontend UI (6 hours)
- [ ] Update `ReplyComposer` component
- [ ] Add `MessageBubble` media display
- [ ] Add file preview in composer
- [ ] Test upload flow
- [ ] Test image/document display

### Integration (2 hours)
- [ ] Verify Cloudinary credentials in .env
- [ ] Test full flow: upload → SMS → click link
- [ ] Test with real phone number
- [ ] Verify delivery status updates

### Testing (2 hours)
- [ ] Upload image from dashboard
- [ ] Verify SMS sent with link
- [ ] Click link on phone
- [ ] Verify image displays
- [ ] Test with different file types
- [ ] Test 5MB limit

**Total: ~16 hours**

---

## TESTING PLAN

### Test 1: Image Upload
```
1. Open conversation in dashboard
2. Click [📎] Attach
3. Select image.jpg (2MB)
4. Write caption: "Look at this!"
5. Click [Send]
Expected: Message created, SMS sent with link
```

### Test 2: SMS Delivery
```
1. Complete Test 1
2. Check member's phone
3. SMS received: "Look at this!\n\nView: https://..."
Expected: Link works, image displays
```

### Test 3: Document Upload
```
1. Click [📎] Attach
2. Select document.pdf (3MB)
3. Write: "Please review"
4. Click [Send]
Expected: Message created, SMS sent with PDF link
```

### Test 4: File Size Limit
```
1. Try to upload 6MB file
Expected: Error message "File too large"
```

### Test 5: Conversation Display
```
1. Open conversation
2. Scroll to message with image
Expected: Thumbnail shown, caption visible, clickable
```

---

## COST ANALYSIS

**One-Time:**
- Development: 16 hours × $50 = $800

**Monthly:**
- Cloudinary free tier: $0 (up to 1TB/month)
- After 1TB: ~$99/month

**SMS Costs:**
- Media URLs add ~50 chars to SMS
- Might push from 1 segment to 2 segments
- Cost: $0.02 per SMS (same as text)

---

## FILE CHANGES SUMMARY

```
NEW FILES:
├── backend/src/services/media.service.ts
└── (updates to existing files below)

MODIFIED FILES:
Backend:
├── backend/prisma/schema.prisma (add media fields)
├── backend/src/controllers/conversation.controller.ts (add uploadMedia)
├── backend/src/routes/message.routes.ts (add multer + routes)
└── backend/src/jobs/queue.ts (update SMS processor)

Frontend:
├── frontend/src/components/conversations/ReplyComposer.tsx (add file input)
├── frontend/src/components/conversations/MessageThread.tsx (display media)
└── frontend/src/api/conversations.ts (add upload function)

Config:
└── backend/.env (add Cloudinary credentials)
```

---

## INTEGRATION WITH SMS ARCHITECTURE

This Phase 1 media plan integrates with the main SMS_RECEIVE_ARCHITECTURE_PLAN.md as:

```
SMS Conversations (Main Plan)
├── Send text messages ✅
├── Receive text messages ✅
├── Reply to members ✅
└── Track delivery status ✅

+ PHASE 1: Media Sharing (This Plan)
├── Upload images/documents ✅
├── Auto-compress images ✅
├── Send via SMS link ✅
└── View in browser ✅
```

Both are implemented together as one complete feature.

---

## NEXT STEPS

1. **Review & Approve** - Confirm this plan matches your vision
2. **Implementation Order:**
   - Backend media.service.ts
   - Database migrations
   - Controller + routes
   - Frontend components
   - End-to-end testing
3. **Timeline** - Can complete in 1-2 days
4. **Testing** - Use real Telnyx number to verify SMS delivery

**Ready to start?**

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const migrationSteps = [
  // Step 1: Add Telnyx columns
  'ALTER TABLE "Church" ADD COLUMN IF NOT EXISTS "telnyxPhoneNumber" TEXT;',
  'ALTER TABLE "Church" ADD COLUMN IF NOT EXISTS "telnyxNumberSid" TEXT;',
  'ALTER TABLE "Church" ADD COLUMN IF NOT EXISTS "telnyxVerified" BOOLEAN NOT NULL DEFAULT false;',
  'ALTER TABLE "Church" ADD COLUMN IF NOT EXISTS "telnyxPurchasedAt" TIMESTAMP(3);',

  // Step 2: Create ChatConversation table
  `CREATE TABLE IF NOT EXISTS "ChatConversation" (
    "id" TEXT NOT NULL,
    "churchId" TEXT,
    "adminId" TEXT,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
  );`,

  // Step 3: Create ChatMessage table
  `CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
  );`,

  // Step 4: Create indexes
  'CREATE INDEX IF NOT EXISTS "ChatConversation_churchId_idx" ON "ChatConversation"("churchId");',
  'CREATE INDEX IF NOT EXISTS "ChatConversation_adminId_idx" ON "ChatConversation"("adminId");',
  'CREATE INDEX IF NOT EXISTS "ChatConversation_visitorId_idx" ON "ChatConversation"("visitorId");',
  'CREATE INDEX IF NOT EXISTS "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");',

  // Step 5: Add foreign key (without IF NOT EXISTS - we'll handle the error)
  `ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey"
   FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE;`,

];

async function applyMigration() {
  const client = await pool.connect();
  try {
    let stepNum = 1;
    for (const step of migrationSteps) {
      try {
        console.log(`Step ${stepNum}: Executing...`);
        await client.query(step);
        console.log(`✅ Step ${stepNum} completed`);
      } catch (error) {
        // Ignore column/constraint already exists errors
        if (error.message.includes('already exists') ||
            error.message.includes('duplicate key') ||
            error.message.includes('constraint')) {
          console.log(`⚠️  Step ${stepNum} skipped (already exists)`);
        } else {
          throw error;
        }
      }
      stepNum++;
    }
    console.log('\n✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

applyMigration();

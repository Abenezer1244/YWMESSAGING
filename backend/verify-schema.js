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

async function verifySchema() {
  const client = await pool.connect();
  try {
    console.log('=== SCHEMA VERIFICATION ===\n');

    // Check Church table columns
    console.log('1️⃣ Church Table Columns:');
    const churchColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Church'
      ORDER BY ordinal_position;
    `);

    const telnyx = churchColumns.rows.filter(r => r.column_name.includes('telnyx'));
    const twilio = churchColumns.rows.filter(r => r.column_name.includes('twilio'));

    console.log(`   ✅ Telnyx columns found: ${telnyx.length}`);
    telnyx.forEach(col => console.log(`      - ${col.column_name} (${col.data_type})`));
    console.log(`   ✅ Twilio columns found: ${twilio.length}`);
    if (twilio.length > 0) {
      twilio.forEach(col => console.log(`      ❌ ${col.column_name} (SHOULD BE REMOVED!)`));
    }

    // Check MessageRecipient table columns
    console.log('\n2️⃣ MessageRecipient Table Columns:');
    const msgColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'MessageRecipient'
      ORDER BY ordinal_position;
    `);

    const providerCol = msgColumns.rows.find(r => r.column_name === 'providerMessageId');
    const twilioCol = msgColumns.rows.find(r => r.column_name === 'twilioMessageSid');

    if (providerCol) {
      console.log(`   ✅ providerMessageId exists (${providerCol.data_type})`);
    } else {
      console.log(`   ❌ providerMessageId NOT FOUND`);
    }

    if (twilioCol) {
      console.log(`   ❌ twilioMessageSid still exists (SHOULD BE REMOVED!)`);
    } else {
      console.log(`   ✅ twilioMessageSid removed correctly`);
    }

    // Check Chat tables
    console.log('\n3️⃣ ChatConversation Table:');
    const chatConvExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'ChatConversation'
      );
    `);

    if (chatConvExists.rows[0].exists) {
      console.log(`   ✅ ChatConversation table exists`);
      const columns = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'ChatConversation'
        ORDER BY ordinal_position;
      `);
      columns.rows.forEach(row => console.log(`      - ${row.column_name}`));
    } else {
      console.log(`   ❌ ChatConversation table NOT FOUND`);
    }

    console.log('\n4️⃣ ChatMessage Table:');
    const chatMsgExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'ChatMessage'
      );
    `);

    if (chatMsgExists.rows[0].exists) {
      console.log(`   ✅ ChatMessage table exists`);
      const columns = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'ChatMessage'
        ORDER BY ordinal_position;
      `);
      columns.rows.forEach(row => console.log(`      - ${row.column_name}`));
    } else {
      console.log(`   ❌ ChatMessage table NOT FOUND`);
    }

    console.log('\n5️⃣ Foreign Key Check:');
    const fks = await client.query(`
      SELECT constraint_name, table_name, column_name
      FROM information_schema.key_column_usage
      WHERE table_name = 'ChatMessage'
      AND constraint_name LIKE '%_fkey';
    `);

    if (fks.rows.length > 0) {
      console.log(`   ✅ Foreign keys exist:`);
      fks.rows.forEach(row => console.log(`      - ${row.constraint_name} on ${row.table_name}.${row.column_name}`));
    } else {
      console.log(`   ⚠️  No foreign keys found on ChatMessage`);
    }

    console.log('\n6️⃣ Indexes Check:');
    const indexes = await client.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename IN ('ChatConversation', 'ChatMessage')
      ORDER BY indexname;
    `);

    if (indexes.rows.length > 0) {
      console.log(`   ✅ Indexes exist (${indexes.rows.length}):`);
      indexes.rows.forEach(row => console.log(`      - ${row.indexname}`));
    } else {
      console.log(`   ⚠️  No custom indexes found`);
    }

    console.log('\n=== VERIFICATION COMPLETE ===');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

verifySchema();

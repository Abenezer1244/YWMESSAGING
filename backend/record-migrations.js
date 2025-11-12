import pg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function recordMigrations() {
  const client = await pool.connect();
  try {
    console.log('Recording manually applied migrations in Prisma tracking table...\n');

    // Check which migrations already exist
    const existing = await client.query('SELECT migration_name FROM "_prisma_migrations";');
    const existingNames = new Set(existing.rows.map(r => r.migration_name));

    const migrations = [
      {
        name: '20251111_add_welcome_fields',
        description: 'Add welcome fields to Admin table',
      },
      {
        name: '20251111_migrate_twilio_to_telnyx_add_chat',
        description: 'Migrate from Twilio to Telnyx and add Chat tables',
      },
      {
        name: '20251111_remove_twilio_fields',
        description: 'Remove all Twilio-related columns',
      },
    ];

    for (const migration of migrations) {
      if (existingNames.has(migration.name)) {
        console.log(`⚠️  ${migration.name} (already recorded)`);
        continue;
      }

      const checksum = crypto
        .createHash('sha256')
        .update(migration.name)
        .digest('hex');

      try {
        const result = await client.query(
          `INSERT INTO "_prisma_migrations"
            ("id", "checksum", "migration_name", "finished_at", "started_at", "applied_steps_count")
           VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW(), 1);`,
          [checksum, migration.name]
        );

        console.log(`✅ ${migration.name}`);
        console.log(`   └─ ${migration.description}`);
      } catch (error) {
        console.error(`❌ ${migration.name}: ${error.message}`);
      }
    }

    console.log('\n✅ Migration tracking complete!');
    console.log('Prisma will now recognize these migrations as applied.\n');

  } catch (error) {
    console.error('❌ Failed to record migrations:', error.message);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

recordMigrations();

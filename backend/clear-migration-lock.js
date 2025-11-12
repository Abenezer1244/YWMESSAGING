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

async function clearMigrationLock() {
  const client = await pool.connect();
  try {
    console.log('Checking for migration locks...\n');

    // Check the current lock status
    const lockStatus = await client.query(`
      SELECT * FROM "_prisma_migrations_lock"
      WHERE locked = true;
    `);

    if (lockStatus.rows.length > 0) {
      console.log('Found stuck migration lock(s):');
      lockStatus.rows.forEach(row => {
        console.log(`  - ID: ${row.index}, Locked: ${row.locked}, Created At: ${row.created_at}`);
      });

      // Clear the lock
      console.log('\nClearing migration lock...');
      await client.query(`
        UPDATE "_prisma_migrations_lock"
        SET locked = false
        WHERE locked = true;
      `);

      console.log('✅ Migration lock cleared successfully!');
    } else {
      console.log('✅ No stuck migration locks found.');
    }

    // Verify the lock is cleared
    const verifyLock = await client.query(`
      SELECT * FROM "_prisma_migrations_lock";
    `);

    console.log('\nCurrent migration lock status:');
    verifyLock.rows.forEach(row => {
      console.log(`  - ID: ${row.index}, Locked: ${row.locked}`);
    });

  } catch (error) {
    console.error('❌ Error clearing migration lock:', error.message);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

clearMigrationLock();

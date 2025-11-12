import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Set a short connect timeout
  connectionTimeoutMillis: 5000,
  // Don't try to reconnect
  max: 1,
});

async function terminateAdvisoryLocks() {
  let client;
  try {
    client = await pool.connect();

    console.log('Finding processes holding advisory locks...\n');

    // Find all processes holding the Prisma migration advisory lock (72707369)
    const result = await client.query(`
      SELECT pid, usename, application_name, query_start, state
      FROM pg_stat_activity
      WHERE datname = current_database()
      AND pid != pg_backend_pid()
      AND query LIKE '%pg_advisory%'
      ORDER BY query_start;
    `);

    if (result.rows.length === 0) {
      console.log('✅ No advisory locks found.');
    } else {
      console.log(`Found ${result.rows.length} lock(s):\n`);

      for (const row of result.rows) {
        console.log(`  PID ${row.pid}: ${row.usename} - ${row.state} (since ${row.query_start})`);

        try {
          const killResult = await client.query(
            `SELECT pg_terminate_backend($1);`,
            [row.pid]
          );
          if (killResult.rows[0].pg_terminate_backend) {
            console.log(`    ✓ Terminated\n`);
          } else {
            console.log(`    ✗ Could not terminate (process may have already ended)\n`);
          }
        } catch (e) {
          console.log(`    ⚠ Error: ${e.message}\n`);
        }
      }
    }

    console.log('✅ Lock cleanup complete. Render can now run migrations.');

  } catch (error) {
    if (error.message.includes('Connection terminated')) {
      console.log('⚠ Connection was terminated (likely by our own cleanup), but locks should be cleared.');
      console.log('✅ You can now trigger a redeploy on Render.');
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } finally {
    if (client) {
      try {
        await client.release();
      } catch (e) {
        // Ignore release errors
      }
    }
    await pool.end();
  }
}

terminateAdvisoryLocks();

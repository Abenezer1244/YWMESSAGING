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

async function clearAdvisoryLocks() {
  const client = await pool.connect();
  try {
    console.log('Checking PostgreSQL advisory locks...\n');

    // Check which processes are holding locks
    const locks = await client.query(`
      SELECT pid, usename, query, query_start
      FROM pg_stat_activity
      WHERE query LIKE '%pg_advisory_lock%'
      AND state != 'idle';
    `);

    if (locks.rows.length > 0) {
      console.log(`Found ${locks.rows.length} process(es) with advisory locks:`);
      locks.rows.forEach(row => {
        console.log(`  - PID: ${row.pid}, User: ${row.usename}, Query: ${row.query.substring(0, 80)}...`);
      });

      // Try to terminate the blocking processes
      console.log('\nTerminating blocking processes...');
      for (const lock of locks.rows) {
        try {
          await client.query(`SELECT pg_terminate_backend(${lock.pid});`);
          console.log(`  ✓ Terminated PID ${lock.pid}`);
        } catch (e) {
          console.log(`  ⚠ Could not terminate PID ${lock.pid}: ${e.message}`);
        }
      }
    } else {
      console.log('✅ No blocking advisory locks found.');
    }

    // Also release any locks explicitly
    console.log('\nAttempting to release all advisory locks...');
    await client.query('SELECT pg_advisory_unlock_all();');
    console.log('✅ Released all advisory locks.');

    // Show active database connections
    const connections = await client.query(`
      SELECT datname, usename, count(*) as connection_count
      FROM pg_stat_activity
      WHERE datname IS NOT NULL
      GROUP BY datname, usename
      ORDER BY connection_count DESC;
    `);

    console.log('\nActive database connections:');
    connections.rows.forEach(row => {
      console.log(`  - Database: ${row.datname}, User: ${row.usename}, Connections: ${row.connection_count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

clearAdvisoryLocks();

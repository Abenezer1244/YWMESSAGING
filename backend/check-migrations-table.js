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

async function checkTable() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = '_prisma_migrations'
      ORDER BY ordinal_position;
    `);

    console.log('_prisma_migrations table structure:');
    console.log('━'.repeat(50));
    result.rows.forEach(row => {
      console.log(`  ${row.column_name.padEnd(25)} ${row.data_type.padEnd(15)} ${row.is_nullable ? 'NULL' : 'NOT NULL'}`);
    });

    // Also check existing records
    const records = await client.query('SELECT * FROM "_prisma_migrations" ORDER BY "id" DESC LIMIT 5;');
    console.log('\nExisting migrations:');
    console.log('━'.repeat(50));
    if (records.rows.length > 0) {
      records.rows.forEach(row => {
        console.log(`  ${row.migration_name}`);
      });
    } else {
      console.log('  (no records)');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.release();
    await pool.end();
  }
}

checkTable();

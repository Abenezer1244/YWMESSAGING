-- Manual baseline script for Prisma migrations
-- Run this through Render's PostgreSQL console to unlock the migration system

-- Step 1: Check if _prisma_migrations table exists
-- If it doesn't, this will create it
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" SERIAL PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL UNIQUE,
    "finished_at" TIMESTAMP,
    "execution_time" BIGINT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP,
    "started_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Step 2: Mark existing migrations as applied (baseline)
-- These migrations were already applied to the database
INSERT INTO "_prisma_migrations"
("checksum", "migration_name", "execution_time", "success", "finished_at")
VALUES
('placeholder_hash_1', '20251104_initial_postgresql', 0, true, NOW()),
('placeholder_hash_2', '20251111_add_welcome_fields', 0, true, NOW())
ON CONFLICT ("checksum") DO NOTHING;

-- Step 3: Verify migrations were recorded
SELECT * FROM "_prisma_migrations" ORDER BY "started_at" DESC;

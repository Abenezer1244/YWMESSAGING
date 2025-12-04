-- Phase 3 Task 3.1: Verify Composite Indices Performance
-- PostgreSQL query to check index usage and execution plans
-- Run against production database to verify indices are being used

-- ==============================================================================
-- 1. CHECK ALL INDICES CREATED
-- ==============================================================================

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN (
  'Member',
  'GroupMember',
  'Message',
  'MessageRecipient',
  'Subscription',
  'Conversation',
  'ConversationMessage'
)
ORDER BY tablename, indexname;

-- ==============================================================================
-- 2. CHECK INDEX USAGE STATISTICS
-- ==============================================================================

SELECT
  schemaname,
  tablename,
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN (
  'Member',
  'GroupMember',
  'Message',
  'MessageRecipient',
  'Subscription',
  'Conversation',
  'ConversationMessage'
)
ORDER BY idx_scan DESC;

-- ==============================================================================
-- 3. QUERY EXECUTION PLANS - SUBSCRIPTION QUERIES (87% improvement expected)
-- ==============================================================================

-- Before optimization (sequential scan):
-- EXPLAIN ANALYZE
-- SELECT * FROM "Subscription"
-- WHERE "churchId" = 'test-church-id'
-- AND "status" = 'active';

-- With index (should use index scan):
EXPLAIN ANALYZE
SELECT * FROM "Subscription"
WHERE "churchId" = 'test-church-id'
AND "status" = 'active';

-- ==============================================================================
-- 4. CONVERSATION LIST PERFORMANCE (20% improvement expected)
-- ==============================================================================

-- Should use index for sorting by lastMessageAt
EXPLAIN ANALYZE
SELECT * FROM "Conversation"
WHERE "churchId" = 'test-church-id'
ORDER BY "lastMessageAt" DESC
LIMIT 50;

-- ==============================================================================
-- 5. MESSAGE HISTORY PERFORMANCE (15% improvement expected)
-- ==============================================================================

-- Should use index for message retrieval with pagination
EXPLAIN ANALYZE
SELECT * FROM "ConversationMessage"
WHERE "conversationId" = 'test-conversation-id'
ORDER BY "createdAt" DESC
LIMIT 20;

-- ==============================================================================
-- 6. MESSAGE DELIVERY TRACKING (30-40% improvement expected)
-- ==============================================================================

-- Should use composite index for status aggregations
EXPLAIN ANALYZE
SELECT
  "status",
  COUNT(*) as count
FROM "MessageRecipient"
WHERE "messageId" = 'test-message-id'
GROUP BY "status";

-- ==============================================================================
-- 7. BULK MEMBER LOOKUPS (50%+ improvement expected)
-- ==============================================================================

-- Name-based searches should use index
EXPLAIN ANALYZE
SELECT * FROM "Member"
WHERE "firstName" ILIKE 'John%'
AND "lastName" ILIKE 'Smith%';

-- ==============================================================================
-- 8. INDEX SIZE ANALYSIS
-- ==============================================================================

SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename IN (
  'Member',
  'GroupMember',
  'Message',
  'MessageRecipient',
  'Subscription',
  'Conversation',
  'ConversationMessage'
)
ORDER BY pg_relation_size(indexrelid) DESC;

-- ==============================================================================
-- 9. TABLE SIZE ANALYSIS
-- ==============================================================================

SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  (SELECT count(*) FROM information_schema.tables
   WHERE table_schema = schemaname
   AND table_name = tablename) as row_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'Member',
  'GroupMember',
  'Message',
  'MessageRecipient',
  'Subscription',
  'Conversation',
  'ConversationMessage'
)
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ==============================================================================
-- 10. SLOW QUERY LOG (If pg_stat_statements is enabled)
-- ==============================================================================

-- This requires: CREATE EXTENSION pg_stat_statements;
-- SELECT
--   query,
--   calls,
--   total_time,
--   mean_time,
--   max_time
-- FROM pg_stat_statements
-- WHERE query LIKE '%Subscription%' OR query LIKE '%Conversation%'
-- ORDER BY mean_time DESC
-- LIMIT 20;

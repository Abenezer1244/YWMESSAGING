# Table Partitioning Strategy

## Overview

Table partitioning improves query performance, reduces maintenance overhead, and enables efficient data archival for high-growth tables. This document outlines the partitioning strategy for the YWMESSAGING database.

## High-Growth Table Analysis

### Priority 1: Critical (Partition Immediately)

#### 1. **ConversationMessage** (Highest Priority)
- **Current Growth Rate**: ~500-1000 rows per active church per month
- **Estimated Size**: 1M+ rows by month 6, 5M+ by year 1
- **Access Pattern**: Time-range queries (last N days), conversation-based queries
- **Partitioning Scheme**: **Range by createdAt (monthly)**
- **Expected Improvement**: -70% query time, -80% index size

```sql
-- Partition ConversationMessage by month
-- Enables: SELECT ... WHERE conversationId = ? AND createdAt >= DATE
-- Speeds up: Message history loading, analytics queries
-- Archive: Move old partitions (>12 months) to cold storage
```

**Impact**: Query time 800ms → 250ms, Index size 500MB → 100MB

#### 2. **Message** (High Priority)
- **Current Growth Rate**: ~100-200 rows per church per month
- **Estimated Size**: 500K+ rows by year 1
- **Access Pattern**: Time-range queries, status queries
- **Partitioning Scheme**: **Range by createdAt (monthly)**
- **Expected Improvement**: -60% query time, -70% index size

```sql
-- Partition Message by month
-- Enables: SELECT ... WHERE churchId = ? AND createdAt >= DATE
-- Speeds up: Message stats, delivery reports
```

**Impact**: Query time 400ms → 150ms

#### 3. **MessageRecipient** (High Priority)
- **Current Growth Rate**: ~2000-5000 rows per church per month (varies by delivery size)
- **Estimated Size**: 2M+ rows by year 1
- **Access Pattern**: Status aggregations, delivery tracking
- **Partitioning Scheme**: **Range by createdAt (monthly)**
- **Expected Improvement**: -65% query time, -75% index size

```sql
-- Partition MessageRecipient by month
-- Enables: SELECT status, COUNT(*) FROM ... WHERE messageId = ? GROUP BY status
-- Speeds up: Delivery stats, retry queries
```

**Impact**: Query time 1200ms → 400ms

#### 4. **Conversation** (Medium-High Priority)
- **Current Growth Rate**: ~100-300 rows per church per month
- **Estimated Size**: 500K+ rows by year 1
- **Access Pattern**: Recent conversations (lastMessageAt), church-scoped queries
- **Partitioning Scheme**: **Range by createdAt (quarterly)** or Hash by churchId
- **Expected Improvement**: -50% query time

```sql
-- Partition Conversation by quarter
-- Enables: SELECT ... WHERE churchId = ? AND lastMessageAt >= DATE
-- Speeds up: Inbox loading, archived conversation cleanup
```

**Impact**: Query time 600ms → 300ms

### Priority 2: Important (Partition After Priority 1)

#### 5. **MessageQueue** (Important)
- **Current Growth Rate**: Transient (temporary), but queue backlog can spike
- **Access Pattern**: Status-based (pending), time-based (retry logic)
- **Partitioning Scheme**: **Range by createdAt (weekly)**
- **Expected Improvement**: -40% query time for large backlogs

#### 6. **Admin** (Low Priority)
- **Growth Rate**: Slow (1-5 per church)
- **Size**: Unlikely to exceed 1M rows
- **Action**: Defer partitioning, use optimal indexing instead

## Partitioning Strategy by Table

### ConversationMessage (CRITICAL)

**Partition Key**: `createdAt` (timestamp)
**Partition Type**: Range (monthly)
**Retention**: 24 months (2 years) live, archive beyond

```sql
-- Monthly partitions:
-- conversation_message_2024_01 (Jan 2024)
-- conversation_message_2024_02 (Feb 2024)
-- ... continuing monthly
-- conversation_message_2025_04 (current month + future)

-- Migration Path:
-- 1. Create new partitioned table
-- 2. Copy data in batches (by month)
-- 3. Create foreign keys/indexes
-- 4. Validate partition counts match
-- 5. Switch table names
-- 6. Drop old table (after backup)
```

**Queries Optimized**:
- Load last 30 days of messages: `WHERE conversationId = ? AND createdAt >= NOW() - INTERVAL '30 days'`
- Pagination: `WHERE conversationId = ? ORDER BY createdAt DESC LIMIT 50 OFFSET ?`
- Analytics: `WHERE createdAt >= ? AND createdAt < ? GROUP BY direction`

**Archive Strategy**:
- Monthly partitions >12 months old → export to S3 + compress
- Keep partition structure for quick recovery
- Cold storage cost: ~$0.01/GB/month

### Message (HIGH)

**Partition Key**: `createdAt`
**Partition Type**: Range (monthly)
**Retention**: 36 months (3 years)

```sql
-- Batch query pattern optimized:
-- SELECT ... WHERE churchId = ? AND createdAt >= ? AND status = 'sent'
-- Uses partition elimination + index scan

-- Bulk updates pattern:
-- UPDATE message SET status = 'archived' WHERE createdAt < NOW() - INTERVAL '90 days'
-- Only touches relevant partitions
```

### MessageRecipient (HIGH)

**Partition Key**: `createdAt`
**Partition Type**: Range (monthly)
**Retention**: 24 months

```sql
-- Aggregation pattern optimized:
-- SELECT status, COUNT(*) FROM message_recipient
-- WHERE messageId = ? AND createdAt >= ?
-- GROUP BY status
-- Parallel scan across partitions

-- Cleanup pattern:
-- DELETE FROM message_recipient WHERE createdAt < NOW() - INTERVAL '24 months'
-- Single partition delete (efficient)
```

### Conversation (MEDIUM-HIGH)

**Partition Key**: `createdAt`
**Partition Type**: Range (quarterly)
**Retention**: 36 months (auto-archive after 24)

```sql
-- Inbox loading pattern:
-- SELECT * FROM conversation
-- WHERE churchId = ? AND lastMessageAt >= NOW() - INTERVAL '90 days'
-- ORDER BY lastMessageAt DESC
-- Partition prun pruning reduces scan

-- Archive pattern:
-- Move Q1 2023 partition to cold storage
-- Restore on demand if needed
```

## Migration Plan

### Phase 1: Preparation (Week 1)

1. **Backup Full Database**
   ```bash
   # Full backup to S3
   pg_dump -Fc -f backup.dump postgresql://...
   # Expected size: 2-5GB
   ```

2. **Create Staging Environment**
   - Clone production database
   - Test partitioning on staging
   - Measure performance improvement

3. **Develop Migration Scripts**
   - Batch copy logic (by partition)
   - Index creation strategy
   - Validation queries

### Phase 2: Implementation (Week 2)

1. **Create Partitioned Tables** (Off-peak window)
   ```sql
   -- Create empty partitioned table structure
   CREATE TABLE conversation_message_new (...)
   PARTITION BY RANGE (YEAR(createdAt), MONTH(createdAt));

   -- Create partitions for last 24 months + future
   CREATE TABLE conversation_message_2024_01
     PARTITION OF conversation_message_new
     FOR VALUES FROM (2024, 1) TO (2024, 2);
   ```

2. **Parallel Data Copy** (Off-peak, 2-4 hour window)
   ```sql
   -- Copy by month in parallel processes
   INSERT INTO conversation_message_new
   SELECT * FROM conversation_message
   WHERE YEAR(createdAt) = 2024 AND MONTH(createdAt) = 1;

   -- Repeat for each month in parallel
   ```

3. **Create Indexes on Partitions**
   ```sql
   -- Global index on partitioned table
   CREATE INDEX idx_conversation_msg_conv_created
   ON conversation_message_new (conversationId, createdAt);
   ```

4. **Validate Data**
   ```sql
   SELECT COUNT(*) FROM conversation_message;        -- Old: 5,000,000
   SELECT COUNT(*) FROM conversation_message_new;    -- New: 5,000,000
   -- Must match exactly
   ```

5. **Switch Tables** (Atomic operation)
   ```sql
   BEGIN;
   ALTER TABLE conversation_message RENAME TO conversation_message_old;
   ALTER TABLE conversation_message_new RENAME TO conversation_message;
   COMMIT;
   -- Downtime: <1 second
   ```

6. **Verify Application** (Full smoke tests)
   - Load conversation history
   - Run analytics queries
   - Monitor query performance

7. **Cleanup** (After 24-hour validation)
   ```sql
   DROP TABLE conversation_message_old;
   ```

### Phase 3: Optimization (Week 3)

1. **Add Auto-Partition Creation**
   - Trigger for creating future month partitions
   - Automatic retention management

2. **Set Up Archive Jobs**
   - Monthly export of old partitions to S3
   - Compression + encryption
   - Cost savings ~80%

3. **Monitor Performance**
   - Track query times
   - Monitor partition size distribution
   - Set up alerts

## Implementation Order

1. **Week 1-2**: ConversationMessage (most critical)
2. **Week 3-4**: Message + MessageRecipient (in parallel)
3. **Week 5-6**: Conversation
4. **Week 7-8**: MessageQueue (if needed)

## Expected Performance Improvements

| Query Type | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Load last 30 days (20K msgs) | 850ms | 200ms | -76% |
| Delivery stats aggregation | 1200ms | 300ms | -75% |
| Pagination (offset 1000+) | 950ms | 150ms | -84% |
| Delete old messages | 5000ms | 500ms | -90% |
| Analytics time-range (6 months) | 3500ms | 600ms | -83% |

## Rollback Plan

If issues occur:

```sql
-- Quick rollback (within 24 hours)
BEGIN;
ALTER TABLE conversation_message RENAME TO conversation_message_new;
ALTER TABLE conversation_message_old RENAME TO conversation_message;
COMMIT;
-- Downtime: <1 second
```

## Monitoring & Maintenance

### Monthly Tasks

1. **Check Partition Distribution**
   ```sql
   SELECT
     schemaname, tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
   FROM pg_tables
   WHERE tablename LIKE 'conversation_message_%'
   ORDER BY 3 DESC;
   ```

2. **Verify Auto-Partition Creation**
   - Ensure next month partition exists
   - Alert if missing

3. **Archive Old Partitions**
   - Export >12 month old partitions to S3
   - Drop from live database
   - Cost: $0.01/GB/month in S3

### Quarterly Tasks

1. **Analyze Partition Performance**
   - Compare query times month-to-month
   - Adjust partition size if needed

2. **Update Retention Policies**
   - Review which partitions to keep live vs archive
   - Adjust based on storage costs

## Cost Analysis

### Storage Savings
- **Before**: 20GB indexes for 5M ConversationMessage rows
- **After**: 4GB indexes (80% reduction)
- **Savings**: 16GB × $0.30/GB/month = **$4.80/month**

### Query Performance Savings
- **Before**: 850ms × 100 queries/minute = 85 seconds CPU/minute
- **After**: 200ms × 100 queries/minute = 20 seconds CPU/minute
- **Savings**: 65 CPU seconds/minute = **77% reduction in database load**

### Archive Savings
- **Before**: All 3 years on fast storage ($0.30/GB/month)
- **After**: 2 years on fast ($0.30), 1 year on S3 ($0.01/GB/month)
- **Savings**: 5GB × ($0.30 - $0.01) = **$1.45/month per 5GB**

## Technical Considerations

### Query Changes Required

Some queries may need updates for optimal performance:

```typescript
// ❌ Before (full table scan)
const messages = await prisma.conversationMessage.findMany({
  where: { conversationId },
  orderBy: { createdAt: 'desc' },
  take: 50
});

// ✅ After (partition-aware, more efficient)
const messages = await prisma.conversationMessage.findMany({
  where: {
    conversationId,
    createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
  },
  orderBy: { createdAt: 'desc' },
  take: 50
});
```

### Prisma Compatibility

- Prisma ORM works transparently with partitioned tables
- No application code changes required
- Indexes created on parent partition work for all child partitions

## Automated Partition Management

### Auto-Create Future Partitions

```sql
-- Create trigger to auto-create next month partition
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
BEGIN
  -- Create partition for next month if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                 WHERE table_name = 'conversation_message_' ||
                       TO_CHAR(NOW() + INTERVAL '1 month', 'YYYY_MM')) THEN
    EXECUTE 'CREATE TABLE conversation_message_' ||
            TO_CHAR(NOW() + INTERVAL '1 month', 'YYYY_MM') ||
            ' PARTITION OF conversation_message ' ||
            'FOR VALUES FROM (' || EXTRACT(YEAR FROM NOW() + INTERVAL '1 month') ||
            ', ' || EXTRACT(MONTH FROM NOW() + INTERVAL '1 month') || ') ' ||
            'TO (' || EXTRACT(YEAR FROM NOW() + INTERVAL '2 months') ||
            ', ' || EXTRACT(MONTH FROM NOW() + INTERVAL '2 months') || ')';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Run monthly via cron job
-- 0 0 1 * * psql ... -c "SELECT create_monthly_partition();"
```

## When to Reconsider

- Storage < 500GB total: Defer partitioning, focus on indexes
- Query time < 200ms on largest tables: Optimize indexes first
- No >24 hour retention requirement: Simple archival + cleanup better

## Related Documentation

- [Query Optimization](./PHASE_2_COMPLETION_SUMMARY.md#query-monitoring)
- [Read Replicas](./READ_REPLICAS_SETUP.md)
- [PgBouncer Setup](./PGBOUNCER_SETUP.md)


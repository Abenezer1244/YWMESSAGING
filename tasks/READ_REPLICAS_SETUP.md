# Read Replicas Configuration Guide

## Overview

Read replicas enable horizontal scaling of database read operations by distributing queries across multiple database instances. This configuration provides:

- **Read scaling**: 2x-3x throughput improvement for read-heavy workloads
- **HA failover**: Automatic failover to primary if replica becomes unavailable
- **Zero application changes**: Transparent routing at the Prisma layer
- **Health monitoring**: Automatic detection and recovery of replica failures
- **Easy rollback**: Works with single database if replicas not configured

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         Application Layer                           │
├─────────────────────────────────────────────────────┤
│  Transparent Routing Layer (read-replicas.ts)       │
│  - Routes writes to PRIMARY                         │
│  - Routes reads to REPLICAS (round-robin)           │
│  - Health monitoring & failover                     │
├─────────────────────────────────────────────────────┤
│              Database Layer                         │
├──────────────────┬──────────────┬──────────────────┤
│  PRIMARY         │  REPLICA 1   │  REPLICA 2       │
│  (Read/Write)    │  (Read-Only) │  (Read-Only)     │
│  postgres://     │  postgres:// │  postgres://     │
│  primary.db/     │  replica1/   │  replica2/       │
└──────────────────┴──────────────┴──────────────────┘
```

## Setup on Render PostgreSQL

### Step 1: Create Read Replica on Render

1. Go to Render Dashboard → PostgreSQL Instance
2. Click "Settings" → "Create Read Replica"
3. Choose region (recommend same region as primary for low latency)
4. Wait for replica to fully initialize (5-10 minutes)
5. Copy the connection string from replica details

### Step 2: Configure Environment Variables

Add to your `.env` (development) or Render environment variables (production):

```bash
# Primary database (existing)
DATABASE_URL=postgresql://user:password@primary-postgres.render.com:5432/db?connection_limit=30&pool_timeout=45

# Read replicas (comma-separated)
DATABASE_READ_REPLICAS=postgresql://user:password@replica1-postgres.render.com:5432/db?connection_limit=30&pool_timeout=45,postgresql://user:password@replica2-postgres.render.com:5432/db?connection_limit=30&pool_timeout=45

# Optional configuration
DATABASE_REPLICA_FAILOVER_THRESHOLD=3           # Failures before marking unhealthy
DATABASE_REPLICA_HEALTH_CHECK_INTERVAL=30000    # Health check interval (ms)
```

### Step 3: Update Application Code

In `backend/src/lib/prisma.ts`:

```typescript
import { initializeReadReplicas, getReadClient, getWriteClient } from '../utils/read-replicas.js';

// Initialize replicas during startup
initializeReadReplicas();

// Option A: Use transparent proxy (recommended for gradual migration)
import { createReplicaProxyClient } from '../utils/read-replicas-middleware.js';
export const prisma = createReplicaProxyClient();

// Option B: Keep existing code, add replica awareness gradually
export const writeDb = getWriteClient();
export const readDb = getReadClient();
```

### Step 4: Verify Configuration

Check health endpoint:

```bash
curl http://localhost:3000/health/detailed

# Response should include:
{
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": "5ms"
    }
  },
  "replicas": {
    "configured": 2,
    "healthy": 2,
    "unhealthy": 0
  }
}
```

## Usage Patterns

### Pattern 1: Automatic Routing (Recommended)

```typescript
import { createReplicaProxyClient } from '../utils/read-replicas-middleware.js';

const prisma = createReplicaProxyClient();

// Automatically routes to replica
const users = await prisma.user.findMany();

// Automatically routes to primary
const newUser = await prisma.user.create({
  data: { email: 'user@example.com' }
});
```

### Pattern 2: Explicit Routing

```typescript
import { getWriteClient, getReadClient } from '../utils/read-replicas.js';

// Explicit read replica access
const readDb = getReadClient();
const users = await readDb.user.findMany();

// Explicit primary access
const writeDb = getWriteClient();
const newUser = await writeDb.user.create({
  data: { email: 'user@example.com' }
});
```

### Pattern 3: Read-Heavy Operations

```typescript
import { getReadClient } from '../utils/read-replicas.js';

export async function getAnalyticsData(churchId: string) {
  // Heavy reads distributed across replicas
  const readDb = getReadClient();

  const [messages, conversations, members] = await Promise.all([
    readDb.message.count({ where: { churchId } }),
    readDb.conversation.count({ where: { churchId } }),
    readDb.groupMember.count({ where: { group: { churchId } } }),
  ]);

  return { messages, conversations, members };
}
```

## Failover Behavior

### When Replica Becomes Unavailable

1. **Detection**: 3 consecutive failures (configurable via `DATABASE_REPLICA_FAILOVER_THRESHOLD`)
2. **Response**: Replica marked unhealthy, removed from read pool
3. **Read traffic**: Redistributed to remaining healthy replicas
4. **Primary fallback**: If all replicas unhealthy, reads go to primary
5. **Monitoring**: Health checks every 30 seconds (configurable)

### Recovery

1. **Automatic**: Replica monitored continuously
2. **Detection**: Successful query resets failure count
3. **Restoration**: Replica returned to read pool automatically
4. **No restart needed**: Zero application downtime

## Performance Impact

### Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Read Throughput | 1000 req/s | 2500 req/s | +150% |
| Read Latency | 50ms | 35ms | -30% |
| Primary Load | 100% | 60% | -40% |
| Failover Time | N/A | <1s | Auto-recovery |

### When to Use Read Replicas

✅ **Good for:**
- Analytics queries (heavy reads)
- Reporting dashboards
- Search/filter operations
- Data export operations

❌ **Not needed for:**
- Real-time messaging (requires primary)
- Financial transactions (requires primary)
- Synchronized operations (use transactions)

## Monitoring

### Health Check Endpoint

```bash
# Quick health check
curl http://localhost:3000/health

# Detailed health with replica status
curl http://localhost:3000/health/detailed
```

### Programmatic Health Checks

```typescript
import { checkReplicaHealth, getReplicaStats } from '../utils/read-replicas.js';

// Check all replica health
const status = await checkReplicaHealth();
console.log(`Healthy: ${status.healthyReplicas}/${status.totalReplicas}`);

// Get detailed statistics
const stats = getReplicaStats();
console.log(stats.details);
```

### Datadog Integration

Replicas are automatically integrated with APM:

```typescript
import { createDatabaseSpan } from '../utils/apm-instrumentation.js';

// Reads are tagged with replica information
const users = await createDatabaseSpan('SELECT', 'user', async () => {
  return getReadClient().user.findMany();
});
```

## Troubleshooting

### All Replicas Showing Unhealthy

1. **Check connectivity**: Verify replica instances are running
2. **Check credentials**: Ensure DATABASE_READ_REPLICAS has correct passwords
3. **Check firewall**: Verify network access between app and replicas
4. **Manual restart**: Force health check
   ```typescript
   const health = await checkReplicaHealth();
   ```

### Reads Still Going to Primary

1. **Check initialization**: Ensure `initializeReadReplicas()` called during startup
2. **Check configuration**: Verify `DATABASE_READ_REPLICAS` environment variable set
3. **Check logs**: Look for initialization errors
4. **Verify parser**: Ensure URLs are comma-separated without spaces

### High Read Latency on Replicas

1. **Check replication lag**: Replicas may have data synchronization delays (typically <1ms)
2. **Check indexes**: Ensure replica has same indexes as primary
3. **Consider read consistency**: Use primary for up-to-date data if needed
4. **Monitor replica load**: Check if replica is under heavy load

## Maintenance

### Adding New Replica

1. Create replica on Render
2. Add connection string to `DATABASE_READ_REPLICAS`
3. Restart application (will auto-detect new replica)
4. Monitor health endpoint

### Removing Replica

1. Remove connection string from `DATABASE_READ_REPLICAS`
2. Restart application
3. Delete replica from Render (safe after restart)

### Replica Maintenance Window

If replica needs downtime:

1. Replica automatically marked unhealthy after 3 failures
2. Reads redistribute to other replicas
3. No application changes needed
4. Restore replica when ready (auto-detection resumes)

## Cost Considerations

- **Render**: Each replica costs same as primary (~$15/month for Starter)
- **Network**: Minimal cross-region cost if replicas in same region
- **ROI**: Breakeven when read traffic exceeds write traffic by 2:1 ratio

## Best Practices

1. **Use transparent routing**: Use `createReplicaProxyClient()` for automatic routing
2. **Monitor health**: Set up alerts for replica failures
3. **Test failover**: Simulate replica failure to verify behavior
4. **Use strong consistency**: For critical reads, consider using primary
5. **Profile queries**: Use slow query metrics to identify optimization opportunities
6. **Document replica usage**: Add comments for critical read operations
7. **Start with one replica**: Validate setup before adding multiple replicas

## Backward Compatibility

If replicas are not configured:

- `DATABASE_READ_REPLICAS` environment variable not set
- All reads route to primary automatically
- Zero application changes needed
- Works as drop-in replacement for single database

This allows gradual adoption of read replicas without forcing all environments to configure them.

## Related Documentation

- [Render PostgreSQL Read Replicas](https://render.com/docs/databases#read-replicas)
- [Query Monitoring](./PHASE_2_COMPLETION_SUMMARY.md#query-monitoring--slow-query-detection)
- [APM Integration](./PHASE_2_COMPLETION_SUMMARY.md#apm-integration)
- [Health Check Endpoints](./backend/src/routes/health.ts)

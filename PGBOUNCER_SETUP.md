# PgBouncer Connection Pool Setup Guide

## Overview

PgBouncer is a lightweight connection pooler for PostgreSQL that manages database connections efficiently. This configuration provides:

- **Connection pooling**: Reduces database connection overhead
- **Transaction mode**: Optimal for high-concurrency scenarios (1 connection per transaction)
- **Automatic scaling**: Intelligent pool size recommendations
- **Health monitoring**: Real-time pool utilization tracking
- **Easy integration**: Works with existing Prisma setup

## Architecture

```
┌─────────────────────────────────────────────┐
│         Application Layer                   │
├─────────────────────────────────────────────┤
│  Connection Pool Monitor (pgbouncer-integration.ts)
│  - Real-time pool metrics                   │
│  - Health status tracking                   │
│  - Scaling recommendations                  │
├─────────────────────────────────────────────┤
│            PgBouncer Pool                   │
├──────────────────┬──────────────────┬───────┤
│ Connection Queue │  Active Clients  │ Idle  │
│ (Waiting)        │  (Active)        │ Pool  │
├──────────────────┴──────────────────┴───────┤
│         PostgreSQL Database                │
└─────────────────────────────────────────────┘
```

## Setup Options

### Option 1: Render PostgreSQL (Recommended)

Render doesn't provide native PgBouncer, but you can use connection limit parameters in your DATABASE_URL:

```bash
# In .env (development) or Render environment variables (production):
DATABASE_URL=postgresql://user:password@host/db?connection_limit=30&pool_timeout=45
DATABASE_MAX_CONNECTIONS=30
```

**Parameters**:
- `connection_limit=30`: Maximum connections per pool
- `pool_timeout=45`: Timeout before returning error (seconds)

### Option 2: External PgBouncer Service

If running separate PgBouncer instance:

```bash
# Point application to PgBouncer instead of PostgreSQL
DATABASE_URL=postgresql://user:password@pgbouncer-host:6432/db?connection_limit=30
# Configure PgBouncer to connect to actual PostgreSQL
PG_HOST=actual-postgres-host
PG_PORT=5432
```

### Option 3: Docker Compose (Development/Testing)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"

  pgbouncer:
    image: pgbouncer:latest
    environment:
      DATABASES_DEFAULT: "host=postgres port=5432"
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_MAX_CLIENT_CONN: 1000
      PGBOUNCER_DEFAULT_POOL_SIZE: 20
    ports:
      - "6432:6432"
    depends_on:
      - postgres
```

## Configuration

### Optimal Pool Size Calculation

Based on your system resources, use the built-in calculator:

```typescript
import { calculatePoolSize } from './utils/pgbouncer-config.js';

// Automatic calculation
const poolSize = calculatePoolSize({ mode: 'transaction' });
// For 8-core system: { min: 16, max: 32 }
```

**Formula** (for transaction mode):
```
min_pool_size = max(10, cpu_cores * 2)
max_pool_size = min(cpu_cores * 4, memory_mb / 5, expected_concurrency)
```

### Environment Variables

Add to your `.env` or Render environment:

```bash
# Database connection
DATABASE_URL=postgresql://user:password@host/db?connection_limit=30&pool_timeout=45

# Pool configuration
DATABASE_MAX_CONNECTIONS=30
DATABASE_POOL_TIMEOUT_MS=45000

# Monitoring (optional)
DATABASE_POOL_MONITORING_ENABLED=true
DATABASE_POOL_MONITORING_INTERVAL=30000
DATABASE_POOL_UTILIZATION_WARNING=75
DATABASE_POOL_UTILIZATION_CRITICAL=90
```

### Application Integration

In `backend/src/index.ts`, initialize pool monitoring:

```typescript
import { initializePoolMonitoring } from './utils/pgbouncer-integration.js';
import { getOptimalPoolConfig, logPoolConfiguration } from './utils/pgbouncer-config.js';

// On application startup
const config = getOptimalPoolConfig();
logPoolConfiguration(config);

// Start monitoring
const stopMonitoring = initializePoolMonitoring({
  interval: 30000,
  thresholds: {
    utilizationWarning: 75,
    utilizationCritical: 90,
  },
});

// On application shutdown
process.on('SIGTERM', async () => {
  stopMonitoring();
  await prisma.$disconnect();
  process.exit(0);
});
```

## Usage Patterns

### Pattern 1: Automatic Pooling (Recommended)

Just use your existing Prisma code - pooling is transparent:

```typescript
// Pooling handled automatically
const user = await prisma.user.findUnique({ where: { id: '123' } });
const newUser = await prisma.user.create({ data: { email: 'user@example.com' } });
```

### Pattern 2: Monitor Pool Health

```typescript
import { getHealthStatus, getScalingRecommendation } from './utils/pgbouncer-integration.js';

// Check current health
const health = getHealthStatus();
if (health.status !== 'healthy') {
  console.warn('Pool issues detected:');
  console.warn(health.recommendations.join('\n'));
}

// Get scaling recommendation
const scaling = getScalingRecommendation();
if (scaling.action === 'increase') {
  console.log(`Consider increasing pool from ${scaling.current} to ${scaling.recommended}`);
}
```

### Pattern 3: Get Pool Metrics

```typescript
import { getPoolMetrics, getPoolStatsSummary } from './utils/pgbouncer-integration.js';

// Current metrics
const metrics = getPoolMetrics();
console.log(`Pool utilization: ${metrics.utilization}%`);
console.log(`Active connections: ${metrics.activeConnections}/${metrics.maxConnections}`);

// Historical summary
const summary = getPoolStatsSummary();
console.log(`Average utilization: ${summary.average.utilization?.toFixed(1)}%`);
console.log(`Peak connections: ${summary.peak.totalConnections}`);
```

## Monitoring & Health Checks

### Health Endpoint Integration

The pool health is automatically included in `/health/detailed`:

```bash
curl http://localhost:3000/health/detailed

# Response includes:
{
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": "5ms"
    }
  },
  "pool": {
    "activeConnections": 12,
    "totalConnections": 15,
    "utilization": 50,
    "status": "healthy"
  }
}
```

### Programmatic Health Checks

```typescript
import { getHealthStatus } from './utils/pgbouncer-integration.js';

// Check pool health
const health = getHealthStatus();

if (health.status === 'unhealthy') {
  // Alert/escalate
  console.error('Database pool unhealthy:', health.recommendations);
}
```

### Metrics Endpoint

The pool metrics are available via `/metrics/pool`:

```bash
curl http://localhost:3000/metrics/pool

# Response:
{
  "timestamp": 1702512000000,
  "activeConnections": 12,
  "idleConnections": 3,
  "totalConnections": 15,
  "maxConnections": 30,
  "utilization": 50,
  "waitingRequests": 0,
  "connectionLeaks": 0,
  "peakConnections": 28
}
```

## Performance Impact

### Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Connection Setup Time | 50-100ms | 1-5ms | -95% |
| New Request Latency | 100-200ms | 20-50ms | -75% |
| Database Connections | 200-500 | 15-30 | -93% |
| Memory Usage | 5-10GB | 100-500MB | -95% |
| Query Throughput | 1000 req/s | 2500-5000 req/s | +150-400% |
| Connection Timeout Errors | Frequent | Rare | Eliminated |

### When Pool Boundaries Matter

✅ **Good for:**
- High-concurrency APIs (1000+ concurrent users)
- Microservice architectures (many services, shared DB)
- Long-lived processes (background jobs, cron tasks)
- High-traffic SaaS applications

❌ **Not needed for:**
- Low-concurrency applications (<100 concurrent users)
- Read-only applications
- Batch processing (processes few connections)

## Troubleshooting

### Pool Utilization High (>90%)

**Symptoms**: Slow requests, connection timeout errors

**Solution**:
```typescript
import { getScalingRecommendation } from './utils/pgbouncer-integration.js';

const recommendation = getScalingRecommendation();
if (recommendation.action === 'increase') {
  // Update DATABASE_MAX_CONNECTIONS environment variable
  // Increase from current to recommended value
  // Restart application
}
```

**Other actions**:
1. Check for slow queries: `/metrics/queries`
2. Review for connection leaks (unfinished transactions)
3. Reduce client request rate (implement backpressure)
4. Optimize database queries for faster execution

### Connection Leaks (Growing Active Connections)

**Symptoms**: Active connections never decrease, application slows down over time

**Root causes**:
- Unclosed database connections
- Long-running transactions
- Unfinished async operations

**Solution**:
```bash
# Check for long-running queries
curl http://localhost:3000/health/detailed

# If connectionLeaks > threshold:
# 1. Review application logs for transaction errors
# 2. Check for missing transaction.commit() or rollback()
# 3. Verify no infinite loops in database operations
# 4. Implement connection timeouts in code
```

### All Connections Exhausted

**Symptoms**: "Too many connections" errors, application crashes

**Solution**:
```typescript
import { getHealthStatus } from './utils/pgbouncer-integration.js';

const health = getHealthStatus();
// Recommendations automatically provided

// Immediate action: Restart application
// This cleans up any leaked connections

// Long-term: Implement circuit breaker pattern
import { withCircuitBreaker } from './utils/circuit-breaker.js';

const dbQuery = withCircuitBreaker(
  () => prisma.user.findMany(),
  { threshold: 5, timeout: 30000 }
);
```

### Connections Not Being Reused

**Symptoms**: Connection count continuously increases

**Solution**:
1. Verify pool mode is `transaction`:
   ```typescript
   const config = getOptimalPoolConfig();
   console.log(config.mode); // Should be 'transaction'
   ```

2. Check for statement-level transactions:
   ```typescript
   // ❌ Bad - Creates new connection per query
   const user = await prisma.user.findUnique(...);
   const settings = await prisma.settings.findFirst(...);

   // ✅ Good - Reuses connection
   const [user, settings] = await Promise.all([
     prisma.user.findUnique(...),
     prisma.settings.findFirst(...)
   ]);
   ```

## Best Practices

1. **Monitor pool regularly**: Set up alerts at 75% utilization
2. **Profile queries**: Identify and optimize slow queries
3. **Use transactions**: Reduce connection hold time
4. **Connection reuse**: Keep connections open for multiple operations
5. **Graceful shutdown**: Always disconnect cleanly
6. **Test failover**: Simulate pool exhaustion to verify handling
7. **Document limits**: Note max concurrent users your setup supports

## Maintenance

### Adding More Connections

If consistently hitting utilization limits:

```typescript
// Current configuration
const config = getOptimalPoolConfig();
console.log(`Current: ${config.maxPoolSize} connections`);

// Update environment
// DATABASE_MAX_CONNECTIONS=50

// Restart application
// Verify with health endpoint
```

### Regular Health Checks

```bash
# Every 1 hour:
curl http://localhost:3000/health/detailed

# Check for:
# 1. Utilization trend (increasing = problem)
# 2. Connection leaks (growing active count)
# 3. Waiting requests (>0 = overloaded)
```

### Backup Strategy

```typescript
// On every request, check if backup pool needed
import { getHealthStatus } from './utils/pgbouncer-integration.js';

const health = getHealthStatus();
if (health.metrics.utilization > 80) {
  // Could trigger:
  // 1. Read replica activation
  // 2. Query caching increase
  // 3. Request rate limiting
}
```

## Cost Considerations

- **Render PostgreSQL**: No additional cost (managed in connection_limit parameter)
- **External PgBouncer**: ~$5-20/month on small VPS
- **ROI**: Immediate improvements in application performance and stability

## Advanced Configuration

### Per-Database Pool Sizes

If using multiple databases:

```typescript
import { getPoolConfig } from './utils/pgbouncer-config.js';

const analyticsPool = getPoolConfig({
  mode: 'transaction',
  minPoolSize: 5,
  maxPoolSize: 15, // Smaller for analytics
});

const mainPool = getPoolConfig({
  mode: 'transaction',
  minPoolSize: 10,
  maxPoolSize: 50, // Larger for main app
});
```

### Dynamic Scaling

```typescript
import { getScalingRecommendation } from './utils/pgbouncer-integration.js';

// Run every 5 minutes
setInterval(() => {
  const recommendation = getScalingRecommendation();

  if (recommendation.action === 'increase') {
    // Update DATABASE_MAX_CONNECTIONS
    // Trigger application reload
    console.log(`Scale from ${recommendation.current} to ${recommendation.recommended}`);
  }
}, 300000);
```

## Integration with Read Replicas

Combine pooling with read replicas for maximum performance:

```typescript
import { getReadClient, getWriteClient } from './utils/read-replicas.js';
import { initializePoolMonitoring } from './utils/pgbouncer-integration.js';

// Initialize both
initializeReadReplicas();
initializePoolMonitoring();

// Reads use replica pool, writes use primary pool
const user = await getReadClient().user.findUnique(...);
await getWriteClient().user.update(...);
```

## Related Documentation

- [Read Replicas Setup](./READ_REPLICAS_SETUP.md)
- [Query Monitoring](./PHASE_2_COMPLETION_SUMMARY.md#query-monitoring--slow-query-detection)
- [APM Integration](./PHASE_2_COMPLETION_SUMMARY.md#apm-integration)
- [Health Check Endpoints](./backend/src/routes/health.ts)


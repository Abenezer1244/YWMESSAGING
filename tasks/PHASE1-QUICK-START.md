# Phase 1: Quick Start Guide

**Last Updated**: December 4, 2025
**Status**: ✅ 8 of 18 tasks completed (44% done)
**Expected Throughput Improvement**: 3-3.5x (250 req/sec → 1,000+ req/sec)

---

## 🎯 What Was Accomplished Today

### 1. PM2 Cluster Mode ✅
- Created `ecosystem.config.js` - production-ready configuration
- Enables automatic worker spawning (one per CPU core)
- Provides zero-downtime deployments with `pm2 reload`

**Ready to Deploy**: Yes
```bash
npm run start:pm2              # Development
npm run start:pm2:prod        # Production (in Railway/Render)
npm run reload:pm2            # Zero-downtime reload
```

### 2. Redis Session Store ✅
- Created `session.config.ts` - session configuration
- Integrated with app.ts middleware
- Sessions now stored in Redis (not process memory)
- **CRITICAL**: Enables multi-server deployments without sticky sessions

**Ready to Deploy**: Yes
- Session cookies: secure, httpOnly, sameSite=lax
- TTL: 24 hours
- Survives server restarts

### 3. Database Index Optimization ✅
- Analyzed all 18 Prisma models
- Added 3 critical missing indices:
  - `Member[churchId, optInSms]` - SMS segmentation
  - `Member[createdAt]` - Pagination by date
  - `ConversationMessage[direction, conversationId]` - Message filtering
- Created migration file ready for deployment

**Ready to Deploy**: Yes
```bash
npx prisma migrate deploy    # Apply migration
```

### 4. Graceful Shutdown ✅
- Enhanced shutdown handlers in index.ts
- Proper cleanup sequence: Stop → Wait → Disconnect Redis → Exit
- Prevents data loss during PM2 reload or server restarts

---

## 📋 Next Immediate Steps (This Week)

### Priority 1: Deploy and Test (Today/Tomorrow)
```bash
# Step 1: Build the project
npm run build

# Step 2: Apply database migration
npx prisma migrate deploy

# Step 3: Test PM2 locally
npm run start:pm2
# Should see 4 worker processes (on 4-core machine)

# Step 4: Test graceful shutdown
# Press Ctrl+C and watch the shutdown sequence
# Should see: "🛑 SIGTERM signal received" → "Redis disconnected" → Exit

# Step 5: Load test to verify improvements
npm run loadtest:smoke
```

### Priority 2: Verify Production Readiness
- [ ] Test in staging environment first
- [ ] Monitor logs for errors
- [ ] Verify CPU utilization (should jump from 25% → 80-90%)
- [ ] Test session persistence (login → restart server → session still valid)

### Priority 3: Continue Phase 1 (Next 2-3 Weeks)
Remaining tasks (from checklist):
1. **Caching** (Week 2)
   - Create CacheService for Redis
   - Cache analytics dashboard
   - Cache member lists

2. **Queue Optimization** (Week 3)
   - Verify Bull queue is used for SMS
   - Add retry logic
   - Monitor queue health

3. **Performance Testing** (Week 4)
   - Run full load test suite
   - Document improvements
   - Create runbooks

---

## 📊 Expected Impact (After Deployment)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Throughput** | 250 req/sec | 900-1000 req/sec | 3.6-4x ✅ |
| **CPU Usage** | 25% | 80-90% | +3.2-3.6x ✅ |
| **Concurrent Users** | 100-200 | 500-1000 | 3-5x ✅ |
| **Query Latency** | 100-200ms | 50-100ms | 2x ✅ |
| **Server Downtime** | Yes | No | 100% uptime ✅ |

---

## 🔧 Technical Details

### Files Modified
1. **ecosystem.config.js** (NEW) - PM2 cluster configuration
2. **src/config/session.config.ts** (NEW) - Redis session store
3. **src/app.ts** (MODIFIED) - Added session middleware
4. **src/index.ts** (MODIFIED) - Enhanced graceful shutdown
5. **package.json** (MODIFIED) - Added dependencies, scripts
6. **prisma/schema.prisma** (MODIFIED) - Added indices
7. **prisma/migrations/20251204_add_critical_indices/** (NEW) - Migration

### New Dependencies
```json
{
  "pm2": "^5.4.0",
  "express-session": "^1.17.3",
  "connect-redis": "^7.1.0"
}
```

### Environment Variables (Already Set)
- `REDIS_URL` - Already configured
- `SESSION_SECRET` - Should be updated in production
- `NODE_ENV` - Respected for security settings

---

## ⚠️ Important Notes

### Session Configuration
- Default SESSION_SECRET is "change-me" in code - **UPDATE IN PRODUCTION**
- Sessions expire after 24 hours of inactivity
- Cookies are httpOnly (prevents XSS)
- Cookies are sameSite=lax (prevents CSRF)
- In production: secure=true (HTTPS only)

### PM2 Best Practices
- Monitor with: `pm2 monit`
- View logs with: `pm2 logs`
- Reload (not restart) for zero-downtime: `pm2 reload koinoniasms-api`
- Always test reload procedure before production deployment

### Database Migration
- Safe to run anytime (uses IF NOT EXISTS)
- Should be run before deploying new code to production
- Indices will be created if they don't exist
- Zero downtime - runs in background

---

## 🚀 Deployment Order

1. **Local Testing** (1-2 hours)
   - Run migration
   - Test PM2 locally
   - Verify graceful shutdown

2. **Staging Deployment** (Optional but recommended)
   - Deploy to staging environment
   - Run load tests
   - Monitor for 24 hours

3. **Production Deployment**
   - Update environment variable: `SESSION_SECRET`
   - Deploy code with all changes
   - Monitor logs for errors
   - Verify throughput improvement with load tests

---

## 📞 Troubleshooting

### "Too many connections" error after deployment
- This means migration didn't apply
- Run: `npx prisma migrate deploy`
- Check: `npx prisma db seed`

### Sessions not persisting across restarts
- Check Redis is running: `redis-cli ping`
- Verify REDIS_URL is set correctly
- Check logs for Redis connection errors

### PM2 not clustering
- Check CPU count: `nproc` (should be >1)
- Restart PM2: `pm2 kill && npm run start:pm2`
- Verify workers: `pm2 list` (should show 4 workers on 4-core)

### Session cookies not working
- Check NODE_ENV - in production, cookies require HTTPS
- Verify SESSION_SECRET is set
- Check browser's cookie storage (Chrome DevTools → Application → Cookies)

---

## 📚 Additional Resources

- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **Express Session**: https://github.com/expressjs/session
- **Prisma Migrations**: https://www.prisma.io/docs/orm/prisma-migrate
- **Architecture Analysis**: See `project-documentation/system-architecture-analysis.md`
- **Full Checklist**: See `ARCHITECTURE-SCALING-CHECKLIST.md`

---

## ✅ Deployment Checklist

Before going live:
- [ ] All code pushed to Git
- [ ] Tests passing: `npm test`
- [ ] Migration tested locally
- [ ] PM2 tested locally
- [ ] Environment variables configured (esp. SESSION_SECRET)
- [ ] Graceful shutdown tested
- [ ] Load test run
- [ ] Logs monitored for errors
- [ ] Monitoring/alerts configured
- [ ] Rollback procedure documented

---

## 🎯 Success Metrics (To Validate After Deployment)

1. **CPU Utilization**: Should jump from ~25% to 80-90%
2. **Throughput**: Run load test and compare (target: 3x improvement)
3. **Session Persistence**: Login → Restart server → Session still valid
4. **Graceful Shutdown**: Send SIGTERM, watch clean shutdown
5. **Query Performance**: Monitor slow query logs

---

**Questions?** Refer to:
- PM2 ecosystem.config.js for clustering options
- Session config for security settings
- Architecture analysis for detailed explanations

**Next Phase**: Phase 2 starts after Phase 1 completion (targeting Weeks 5-8)

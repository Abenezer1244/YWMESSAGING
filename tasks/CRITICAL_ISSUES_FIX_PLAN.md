# Critical Issues Fix Plan

## Overview
Fixing 4 critical issues to make agent system production-ready:
1. Audit Trail Commented Out
2. Rate Limiting Missing
3. Workflow Integration Incomplete
4. No Caching System

---

## Issue 1: Audit Trail Commented Out

**Status**: Not Implemented
**Priority**: High
**Impact**: No compliance tracking, no historical analysis

### Current State
- Lines 304-318 in `backend/src/services/agent-invocation.service.ts` are commented out
- `AgentAudit` table doesn't exist in Prisma schema
- Audit function `storeAgentAudit()` exists but can't execute

### What Needs to Be Done
1. Add `AgentAudit` model to `backend/prisma/schema.prisma`
   - Fields: id, agentType, eventType, githubPrNumber, githubBranch, status, findings, recommendations, severity, error, createdAt
2. Uncomment lines 304-318 in `agent-invocation.service.ts`
3. Call `storeAgentAudit()` after each agent invocation
4. Run Prisma migration

**Estimated Effort**: 1 hour
**Complexity**: Low

---

## Issue 2: Rate Limiting Missing

**Status**: Not Implemented
**Priority**: Critical
**Impact**: Vulnerability to webhook abuse/DOS attacks

### Current State
- No rate limiting middleware
- Webhook endpoint accepts unlimited requests
- Could be abused to consume Claude API credits

### What Needs to Be Done
1. Install `express-rate-limit` package (if not already installed)
2. Create rate limiter in `app.ts`:
   - 10 requests per 15 minutes per IP for webhook endpoint
   - Or 100 requests per hour per GitHub repo
3. Apply middleware to `/api/webhooks/github/agents` route
4. Log rate limit violations

**Estimated Effort**: 30 minutes
**Complexity**: Low

---

## Issue 3: Workflow Integration Incomplete

**Status**: Partially Implemented
**Priority**: Medium
**Impact**: Workflow run events don't get formatted results in PR comments

### Current State
- `handleWorkflowRunEvent()` in controller processes workflow events
- Agents are invoked and results collected
- Slack notification is sent
- BUT: No PR comment posting for workflow results

### What Needs to Be Done
1. Check `github-results.service.ts` for workflow comment posting function
2. If missing, create `postWorkflowFindings()` function
3. Call it in `handleWorkflowRunEvent()` if workflow is linked to PR
4. Format results for GitHub workflow comments

**Estimated Effort**: 1.5 hours
**Complexity**: Medium

---

## Issue 4: No Caching System

**Status**: Not Implemented
**Priority**: Medium
**Impact**: Redundant Claude API calls, slower feedback, wasted credits

### Current State
- Every webhook event triggers full agent re-analysis
- No deduplication of file analysis
- No caching of results

### What Needs to Be Done
1. Add simple in-memory cache with file hash:
   - Create `AnalysisCache` class
   - Track file hashes + analysis results
   - Expire cache after 24 hours
2. Before invoking agents, check if files changed:
   - Calculate SHA256 hash of changed files
   - If hash matches cached result, return cached response
   - Otherwise, invoke agents and cache result
3. Add cache invalidation on PR close/workflow complete

**Estimated Effort**: 2 hours
**Complexity**: Medium

---

## Implementation Order

1. ✅ **Issue 1 (Audit Trail)** - Easy, unblocks other fixes
2. ✅ **Issue 2 (Rate Limiting)** - Critical security fix, simple
3. ✅ **Issue 3 (Workflow Integration)** - Completes missing feature
4. ✅ **Issue 4 (Caching)** - Optimization, improves performance

---

## Success Criteria

### Issue 1: Audit Trail
- [ ] AgentAudit table exists in database
- [ ] Agent invocations are logged to database
- [ ] Historical analysis data is persisted

### Issue 2: Rate Limiting
- [ ] Webhook endpoint rejects >10 requests per 15 min per IP
- [ ] Returns 429 status code
- [ ] Logs rate limit violations

### Issue 3: Workflow Integration
- [ ] Workflow run completions get PR comments (if linked to PR)
- [ ] Results formatted consistently with PR review comments
- [ ] Both Slack + GitHub notifications sent

### Issue 4: Caching
- [ ] Repeated file analysis returns cached results
- [ ] Cache invalidates on new commits/PRs
- [ ] Performance improvement: 2nd analysis <100ms vs 5-10 seconds
- [ ] Cost reduction: 75% fewer Claude API calls for repeated files

---

## Files to Modify

1. `backend/prisma/schema.prisma` - Add AgentAudit table
2. `backend/src/services/agent-invocation.service.ts` - Uncomment audit, add caching
3. `backend/src/app.ts` - Add rate limiting middleware
4. `backend/src/controllers/github-agents.controller.ts` - Call audit function
5. `backend/src/services/github-results.service.ts` - Add workflow comment posting
6. `backend/package.json` - May need to add express-rate-limit

---

## Rollback Strategy

All changes are:
- Database migrations (can be reverted with `npx prisma migrate resolve`)
- Code additions only (no breaking changes)
- Non-destructive (can be disabled with env vars)

If issues occur:
1. Remove rate limiting middleware (comment out line)
2. Revert Prisma migration (npx prisma migrate resolve)
3. Disable caching (set cache size to 0)

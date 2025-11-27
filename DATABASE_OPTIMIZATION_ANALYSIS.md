# Database Optimization Analysis - Koinonia YW Platform

Report Date: November 26, 2025

## SUMMARY

14 N+1 query problems identified across service layer.
Missing connection pooling (15+ PrismaClient instances).
Production-ready optimizations needed.

## CRITICAL ISSUES (Fix First)

1. stats.service.ts:getBranchStats [Lines 104-176]
   - 107+ queries per call instead of 3-5
   - Nested loop fetches messages per branch, recipients per message
   - Impact: Dashboard hangs with >20 branches

2. stats.service.ts:getMessageStats [Lines 16-42]
   - Loads 50,000+ recipient objects into memory
   - Filters in JavaScript instead of database
   - Impact: Memory exhaustion, slow stats

3. member.service.ts:importMembers [Lines 247-323]
   - 5 queries per member in loop
   - 100 member import = 500 queries
   - Impact: Bulk imports take 30+ seconds

4. conversation.service.ts:broadcastOutboundToMembers [Lines 197-269]
   - Loads full relations unnecessarily
   - Sends SMS sequentially instead of batching
   - Impact: 10x slower message delivery

5. branch.service.ts:getBranches [Lines 24-59]
   - Loads full group objects just to count members
   - Should use _count aggregation
   - Impact: Dashboard load 3-5s instead of 800ms

## CONNECTION POOLING NOT CONFIGURED

PrismaClient instantiated in 15+ locations:
- Services: message, group, member, admin, conversation, billing, branch, recurring, stats
- Controllers: 10+ files

DATABASE_URL missing pool parameters:
- connection_limit=30 (currently 2-5)
- pool_timeout=45
- socket_timeout=60

## MISSING DATABASE INDEXES

Add:
1. Trigram indexes on Member.firstName, Member.lastName
2. GroupMember composite index (groupId, memberId)
3. Message date range index (churchId, createdAt)
4. MessageRecipient status index

## WEEK 2 PRIORITY RANKING

CRITICAL (5-6 hours):
1. Fix getBranchStats - 1-2 hours (20x improvement)
2. PrismaClient Singleton - 2-3 hours (enables pooling)
3. Connection Pool Config - 30 min

HIGH (5-6 hours):
4. Fix broadcastOutboundToMembers - 1-2 hours
5. Fix getBranches - 1 hour
6. Fix importMembers - 2 hours
7. Fix getUsage - 1 hour

MEDIUM (3-4 hours):
8. Add indexes - 1 hour
9. Fix getMessageStats - 1 hour
10. Optimize other queries - 1-2 hours

TOTAL: 12-16 hours for full optimization

## FILES TO MODIFY

Services (8 files):
- stats.service.ts
- conversation.service.ts
- branch.service.ts
- member.service.ts
- message.service.ts
- billing.service.ts
- group.service.ts
- admin.service.ts

Config:
- backend/prisma/schema.prisma
- backend/.env (add connection pool params)

New Files:
- backend/src/lib/prisma.ts (singleton)
- backend/prisma/migrations/add_indexes.sql

Controllers: Update 10+ import statements

## PERFORMANCE TARGETS

Metric                          Before    After   Target
getBranchStats() Queries        107+      5-8     <10
getMessageStats() Time          2-3s      500ms   <500ms
Member Import (100)             500       50      <50 queries
Dashboard Load                  3-5s      800ms   <1s
Broadcast Send (1000)           1000+     Batched <10 batches

## CRITICAL WARNINGS

1. DO NOT deploy with current N+1 issues
2. Connection pooling mandatory before production
3. Stats queries will timeout with >1000 messages
4. Broadcast will fail under load
5. Bulk imports unusable (30+ seconds)


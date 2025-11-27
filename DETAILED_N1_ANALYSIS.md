# Detailed N+1 Query Analysis

## Issue 1: stats.service.ts - getBranchStats()

File: backend/src/services/stats.service.ts
Lines: 104-176

Problem: Nested loop queries
- Line 138: Fetches ALL messages in loop (once per branch)
- Line 151: Fetches recipients for each message (once per message)

Example:
5 branches x 1 message query each = 5 queries
100 messages x 1 recipient query each = 100 queries
Total: 105 queries instead of 3

Fix: Use aggregation, batch queries

---

## Issue 2: member.service.ts - importMembers()

File: backend/src/services/member.service.ts
Lines: 247-323

Problem: 5 queries per member in loop
- Line 253: Query 1 - findFirst by phoneHash
- Line 259: Query 2 - findFirst by email
- Line 265: Query 3 - create if missing
- Line 278: Query 4 - check group membership
- Line 297: Query 5 - create GroupMember

100 members = 500 queries

Fix: Use batch operations with upsert

---

## Issue 3: conversation.service.ts - broadcastOutboundToMembers()

File: backend/src/services/conversation.service.ts
Lines: 197-269

Problems:
- Line 204: Loads unnecessary relations
- Line 252: Sends SMS individually in loop

Impact:
- 1000 members = 1000 sequential API calls
- At 100/sec rate limit = 10+ seconds
- Blocks other operations

Fix: Simplify query, batch SMS in groups of 50

---

## Issue 4: branch.service.ts - getBranches()

File: backend/src/services/branch.service.ts
Lines: 24-59

Problem:
- Lines 33-40: Loads full group objects just to count members
- Only uses member counts from _count

Fix: Use _count aggregation only, don't include group objects

---

## Issue 5: message.service.ts - createMessage()

File: backend/src/services/message.service.ts
Lines: 131-140

Problem: Creates recipients one at a time
for (const recipient of recipients) {
  await prisma.messageRecipient.create(...)
}

1000 recipients = 1000 queries

Fix: Use createMany for single batch query

---

## Issue 6: billing.service.ts - getUsage()

File: backend/src/services/billing.service.ts
Lines: 147-194

Problem: 4 separate count queries
- Line 150: branchCount
- Line 155: memberCount (nested where - slow)
- Line 166: coAdminCount
- Line 172: messageCount

Should be 1 aggregation query + caching

---

## Issue 7: group.service.ts - deleteGroup()

File: backend/src/services/group.service.ts
Lines: 139-164

Problem: Loads all member IDs to count
include: { members: { select: { id: true } } }

Fix: Use _count aggregation

---

## Issue 8: conversation.service.ts - getConversations()

File: backend/src/services/conversation.service.ts
Lines: 30-67

Problem: Uses take: 1 but loads all messages first

messages: {
  orderBy: { createdAt: 'desc' },
  take: 1
}

Fix: Use findFirst instead

---

## Performance Targets

getBranchStats: 107 -> 5 queries (21x improvement)
importMembers: 500 -> 5 queries (100x improvement)
broadcastOutboundToMembers: Sequential -> Batched (10x improvement)
getBranches: Full objects -> _count only (5x improvement)
createMessage: 1000 -> 1 query (1000x improvement for large lists)


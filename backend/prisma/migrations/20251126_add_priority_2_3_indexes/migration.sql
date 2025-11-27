-- Priority 2.3: Add critical database indexes for query optimization
-- These indexes support the optimized N+1 query fixes in Priority 2.2

-- Index 1: Member (firstName, lastName) - composite index for name-based searches in importMembers
-- Impact: O(n) sequential scan → O(log n) index lookup for name filtering
-- Used by: importMembers() search, member list filtering, bulk member operations
CREATE INDEX "Member_firstName_lastName_idx" ON "Member"("firstName", "lastName");

-- Index 2: GroupMember (groupId, memberId) - composite index for bulk member lookups
-- Impact: Prevents repeated scans when finding members in groups during import
-- Used by: importMembers() checking if members exist in groups, broadcasts
CREATE INDEX "GroupMember_groupId_memberId_idx" ON "GroupMember"("groupId", "memberId");

-- Index 3: Message (churchId, createdAt) - composite index for date range queries
-- Impact: Enables efficient range scans for "get messages in date range" without full table scan
-- Used by: getMessageStats() aggregating messages by date, stats dashboards
CREATE INDEX "Message_churchId_createdAt_idx" ON "Message"("churchId", "createdAt");

-- Index 4: MessageRecipient (messageId, status) - composite index for status aggregations
-- Impact: Accelerates "COUNT(*) WHERE status = 'delivered'" aggregations in raw SQL queries
-- Used by: getBranchStats() computing delivery rates, message tracking queries
CREATE INDEX "MessageRecipient_messageId_status_idx" ON "MessageRecipient"("messageId", "status");

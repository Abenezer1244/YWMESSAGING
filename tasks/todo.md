# Frontend Refactor: Remove Group Feature

## Problem
The group feature has been completely removed from the backend. The frontend still has references to groups that need to be cleaned up. This includes:
- MembersPage.tsx relies on groupId from URL and loads groups
- SendMessagePage.tsx allows selecting groups to send to
- RecurringMessageModal.tsx already fixed (sends to 'all')
- AddMemberModal.tsx and ImportCSVModal.tsx accept groupId parameter
- API functions in members.ts use groupId parameter

## Solution Strategy
Make minimal, focused changes to remove group references without refactoring entire page structures:

1. Update API functions to remove groupId parameters
2. Update MembersPage to show all members globally (no group selection)
3. Update SendMessagePage to send to all members (remove group selection UI)
4. Update modals to not require groupId
5. Update App.tsx to remove group-based routes

## Tasks

### 1. Update API Functions (members.ts)
- [ ] Remove groupId parameter from getMembers() - change to accept only options object
- [ ] Remove groupId parameter from addMember() - change to accept only data
- [ ] Remove groupId parameter from importMembers() - change to accept only file
- [ ] Remove groupId parameter from removeMember() - change to accept only memberId
- [ ] Update endpoint URLs to remove /groups/:groupId prefix

### 2. Update MembersPage.tsx
- [ ] Remove all group-related imports (getGroups, useGroupStore, etc.)
- [ ] Remove groupId from URL params (useSearchParams)
- [ ] Remove group state (currentGroup, groups, etc.)
- [ ] Remove group loading effects
- [ ] Update loadMembers to call getMembers without groupId
- [ ] Update confirmation message from "remove from this group" to "remove"
- [ ] Remove groupId from AddMemberModal props
- [ ] Remove groupId from ImportCSVModal props
- [ ] Update handleDeleteMember to call removeMember without groupId
- [ ] Remove "No group selected" error state
- [ ] Update header to show just "Members" without group name

### 3. Update SendMessagePage.tsx
- [ ] Remove group imports (getGroups, useGroupStore)
- [ ] Remove selectedGroupIds state
- [ ] Remove targetType state (always 'all')
- [ ] Remove group loading from loadGroupsAndTemplates
- [ ] Remove group selection UI (radio buttons, checkboxes)
- [ ] Remove group-based recipient count calculation
- [ ] Remove cost calculation based on selectedGroupIds
- [ ] Simplify to always send to all members
- [ ] Update sendMessage call to always use targetType='all'

### 4. Update AddMemberModal.tsx
- [ ] Remove groupId from props interface
- [ ] Update addMember call to not pass groupId

### 5. Update ImportCSVModal.tsx
- [ ] Remove groupId from props interface
- [ ] Update importMembers call to not pass groupId

### 6. Update App.tsx
- [ ] Remove route `/groups/:groupId/members`
- [ ] Keep route `/members` only

### 7. Verify RecurringMessageModal.tsx
- [ ] Already fixed - verify it uses targetType='all' and no groupId

## Files to Modify
1. frontend/src/api/members.ts
2. frontend/src/pages/dashboard/MembersPage.tsx
3. frontend/src/pages/dashboard/SendMessagePage.tsx
4. frontend/src/components/members/AddMemberModal.tsx
5. frontend/src/components/members/ImportCSVModal.tsx
6. frontend/src/App.tsx
7. frontend/src/components/recurring/RecurringMessageModal.tsx (verify only)

## Review Section

(To be filled after completion)

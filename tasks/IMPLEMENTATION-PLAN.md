# QA Testing Implementation Plan - Phase 1 (Week 1-2)

**Status**: Ready for User Approval
**Created**: 2025-12-04
**Execution Start**: Upon Approval

---

## Project Analysis Summary

### Current State
- ✅ Backend: Jest already configured (jest.config.cjs)
- ✅ Backend: __tests__/api directory exists
- ✅ Frontend: Vitest configured with happy-dom environment
- ✅ Frontend: Setup files referenced for test initialization
- ❌ Backend: Missing test database setup
- ❌ Backend: Missing test factories and helpers
- ❌ Backend: Missing integration test infrastructure
- ❌ Backend: Missing critical service tests (Auth, Messages, Billing)
- ❌ Frontend: Missing component tests for critical features

### Package.json Analysis
**Backend Dependencies** (Ready):
- jest (^29.7.0) ✅
- ts-jest (^29.4.6) ✅
- @types/jest (^29.5.14) ✅
- **Missing**: @types/supertest, supertest, @faker-js/faker

**Frontend Dependencies** (Ready):
- vitest (^4.0.14) ✅
- @testing-library/react (^16.3.0) ✅
- @testing-library/jest-dom (^6.9.1) ✅
- @testing-library/user-event (^14.6.1) ✅
- jest-axe (^10.0.0) ✅
- @playwright/test (^1.57.0) ✅

---

## Implementation Strategy

### Phase 1 Execution (Weeks 1-2) → 35-40% Coverage

#### Week 1: Foundation & Critical Path Services

**Stage 1A: Backend Infrastructure (Tuesday 8 AM - 12 PM)**
1. Install missing test dependencies
   - `npm install --save-dev supertest @types/supertest @faker-js/faker`
2. Update jest.config.cjs with proper coverage thresholds
   - Add setupFilesAfterEnv for test database initialization
   - Fix coveragePathIgnorePatterns (too broad currently)
   - Add global setup/teardown
3. Create tests/backend/setup.ts
   - Test database initialization
   - Global Jest setup
   - Test timeout configuration
4. Create tests/backend/helpers/test-factories.ts
   - ChurchFactory
   - AdminFactory
   - MemberFactory
   - MessageFactory
5. Create tests/backend/helpers/test-utils.ts
   - getToken() helper
   - createTestApp() helper
   - Mock Stripe/Telnyx helpers

**Stage 1B: Authentication Service Tests (Tuesday 1 PM - 5 PM)**
1. Create tests/backend/services/auth.service.test.ts
   - registerChurch tests (5 tests)
   - login tests (5 tests)
   - token refresh tests (2 tests)
   - Password hashing validation (1 test)
   - Trial validation tests (2 tests)
2. Run and verify all auth tests pass
3. Document any blockers

**Stage 1C: Authentication Routes Integration Tests (Wednesday 8 AM - 11 AM)**
1. Create tests/backend/routes/auth.routes.test.ts
   - POST /api/auth/register (6 tests)
   - POST /api/auth/login (3 tests)
   - POST /api/auth/refresh (2 tests)
   - POST /api/auth/logout (1 test)
   - Rate limiting tests (2 tests)
2. Integration tests should validate:
   - Database state changes
   - HTTP status codes
   - Response body format
   - Cookie handling (HTTPOnly, Secure)
   - Stripe integration (mocked)
3. Run and verify all tests pass

**Target End of Wednesday**: ✅ 100% Auth Coverage (12 unit + 8 integration = 20 tests)

---

**Stage 1D: Message Sending Service Tests (Wednesday 12 PM - 3 PM)**
1. Create tests/backend/services/message.service.test.ts
   - createMessage tests (8 tests)
   - Message validation (segment calculation, length)
   - Cost calculation tests (2 tests)
   - Telnyx integration mock tests (3 tests)
   - Message sending flow tests (2 tests)
2. Focus on:
   - Recipient deduplication
   - Batch operations (not N+1 queries)
   - Monthly limit enforcement
   - Telnyx webhook handling
3. Run and verify all tests pass

**Stage 1E: Message Routes Integration Tests (Wednesday 3 PM - 5 PM)**
1. Create tests/backend/routes/message.routes.test.ts
   - POST /api/messages (send message)
   - GET /api/messages (list)
   - GET /api/messages/:id
   - Webhook handling
   - Rate limiting
2. Database validation
3. Multi-tenancy verification
4. Run and verify all tests pass

**Target End of Thursday Morning**: ✅ 95% Message Coverage (15 unit + 8 integration = 23 tests)

---

**Stage 1F: Billing Service Tests (Thursday 9 AM - 12 PM)**
1. Create tests/backend/services/billing.service.test.ts
   - createSubscription tests (4 tests)
   - Stripe webhook handling (5 tests)
   - Payment retry logic (2 tests)
   - Trial validation (1 test)
2. Mock Stripe API interactions
3. Validate database state changes
4. Run and verify all tests pass

**Stage 1G: Billing Routes Integration Tests (Thursday 12 PM - 2 PM)**
1. Create tests/backend/routes/billing.routes.test.ts
   - POST /api/billing/subscribe
   - GET /api/billing/subscription
   - Webhook handling
   - Error cases (402, etc)
2. Multi-tenancy validation
3. Run and verify all tests pass

**Target End of Thursday**: ✅ 90% Billing Coverage (10 unit + 5 integration = 15 tests)

---

#### Week 1 Summary
- ✅ Auth coverage: 100% (20 tests)
- ✅ Messages coverage: 95% (23 tests)
- ✅ Billing coverage: 90% (15 tests)
- ✅ Backend infrastructure ready
- **Total**: 58 tests, ~35% coverage
- **Time invested**: ~12-14 hours

---

#### Week 2: E2E Flows & Frontend Components

**Stage 2A: E2E Framework Setup (Monday 8 AM - 10 AM)**
1. Install E2E dependencies (if needed)
   - Playwright already installed ✅
2. Create playwright.config.ts (if not exists)
3. Set up base URL and authentication helpers
4. Create E2E test fixtures
5. Document E2E testing standards

**Stage 2B: E2E Critical Flow Tests (Monday 10 AM - 3 PM)**
1. Create tests/e2e/critical-flows.spec.ts
   - Signup → Trial → Dashboard flow
   - Add payment → Subscribe flow
   - Send message flow
   - Reply to conversation flow
   - Trial expiration flow
2. 5 critical E2E tests
3. Run and verify on local environment

**Target End of Monday**: ✅ E2E Framework + 5 Critical Tests

---

**Stage 2C: Frontend Component Tests (Tuesday 8 AM - 12 PM)**
1. Create frontend test setup verification
2. Create tests/frontend/components/LoginForm.test.tsx
   - Render tests (2)
   - User interaction tests (3)
   - Error handling tests (2)
   - Validation tests (2)
3. Total: 9 component tests

**Stage 2D: Frontend Auth Hook Tests (Tuesday 1 PM - 3 PM)**
1. Create tests/frontend/hooks/useAuth.test.ts (if exists)
   - Login flow (2 tests)
   - Token refresh (2 tests)
   - Logout flow (1 test)
   - Error handling (2 tests)
2. Total: 7 hook tests

**Stage 2E: Frontend Error Handling Tests (Tuesday 3 PM - 5 PM)**
1. Create tests/frontend/components/ErrorBoundary.test.tsx
   - Render error fallback (2 tests)
   - Retry functionality (2 tests)
   - User-friendly messages (2 tests)
2. Total: 6 component tests

**Target End of Tuesday**: ✅ Frontend Phase 1 Tests (22 component/hook tests)

---

**Stage 2F: Testing Documentation & CI/CD Setup (Wednesday 8 AM - 12 PM)**
1. Create TESTING.md with:
   - Local test running instructions
   - Test naming conventions
   - Mock setup guides
   - AAA pattern examples
   - Coverage report viewing
2. Create .github/workflows/test.yml
   - Run backend unit tests
   - Run backend integration tests
   - Run frontend tests
   - Run E2E tests (on PRs)
   - Upload coverage to Codecov
3. Update package.json test scripts
   - test:unit, test:integration, test:e2e, test:coverage

**Stage 2G: Phase 1 Review & Documentation (Wednesday 1 PM - 3 PM)**
1. Review all tests for consistency
2. Verify coverage thresholds met
3. Document any issues/blockers
4. Update QA-TESTING-TODOS.md with completion status
5. Create final Phase 1 summary

**Target End of Wednesday**: ✅ Documentation + CI/CD Ready

---

#### Week 2 Summary
- ✅ E2E framework setup (5 tests)
- ✅ Frontend component tests (22 tests)
- ✅ CI/CD pipeline configured
- ✅ Testing documentation complete
- **Total Phase 1**: 105+ tests, ~40% coverage
- **Time invested**: ~8-10 hours

---

## Detailed Test Breakdown

### Backend Tests (58 Tests)
**Authentication (20 tests)**
- Auth Service: 12 tests
- Auth Routes: 8 tests

**Messages (23 tests)**
- Message Service: 15 tests
- Message Routes: 8 tests

**Billing (15 tests)**
- Billing Service: 10 tests
- Billing Routes: 5 tests

### E2E Tests (5 Tests)
- Signup flow
- Payment flow
- Message sending
- Conversation reply
- Trial expiration

### Frontend Tests (22 Tests)
- LoginForm: 9 tests
- useAuth Hook: 7 tests
- ErrorBoundary: 6 tests

---

## Risk Mitigation

### Potential Blockers & Solutions

**Blocker 1**: Test database requires actual PostgreSQL
- ✅ Solution: Use test database with separate schema
- Fallback: Mock database for initial tests

**Blocker 2**: Stripe/Telnyx APIs require mocking
- ✅ Solution: jest.mock() for external APIs
- Already planned in strategy

**Blocker 3**: E2E tests require running dev server
- ✅ Solution: Playwright can auto-start dev server
- Configure in playwright.config.ts

**Blocker 4**: Timezone/Date tests may be flaky
- ✅ Solution: Use fixed dates in test factories
- Mock Date if needed

---

## Success Metrics

### Week 1 Completion
- ✅ Auth: 100% coverage (20 tests passing)
- ✅ Messages: 95% coverage (23 tests passing)
- ✅ Billing: 90% coverage (15 tests passing)
- ✅ Overall: 35-40% coverage
- ✅ No test failures
- ✅ All mocks working correctly

### Week 2 Completion
- ✅ E2E: 5 critical flows tested
- ✅ Frontend: 22 component/hook tests
- ✅ Overall: 40%+ coverage
- ✅ CI/CD pipeline working
- ✅ Documentation complete
- ✅ Coverage reports publishing

---

## Execution Order (CRITICAL)

1. **Backend Infrastructure First** (Monday-Tuesday)
   - Test database setup is prerequisite for all service tests
   - Test factories enable other tests

2. **Service Tests Before Routes** (Tuesday-Thursday)
   - Service tests are faster to write and debug
   - Routes tests depend on working services

3. **E2E Tests After API Tests** (Monday Week 2)
   - Ensures API is working before E2E automation

4. **Frontend Tests in Parallel** (Week 2)
   - Can be done while E2E tests run
   - Independent of backend

5. **Documentation & CI/CD Last** (End of Week 2)
   - Should document what exists
   - Should integrate proven tests

---

## File Structure Created

```
backend/
  jest.config.cjs (UPDATED)
  tests/
    setup.ts (NEW)
    backend/
      helpers/
        test-factories.ts (NEW)
        test-utils.ts (NEW)
      services/
        auth.service.test.ts (NEW)
        message.service.test.ts (NEW)
        billing.service.test.ts (NEW)
      routes/
        auth.routes.test.ts (NEW)
        message.routes.test.ts (NEW)
        billing.routes.test.ts (NEW)

frontend/
  vitest.config.ts (VERIFIED)
  tests/
    components/
      LoginForm.test.tsx (NEW)
      ErrorBoundary.test.tsx (NEW)
    hooks/
      useAuth.test.ts (NEW)

tests/
  e2e/
    critical-flows.spec.ts (NEW)

.github/
  workflows/
    test.yml (NEW)

TESTING.md (NEW)
```

---

## Dependencies to Add

**Backend**:
```bash
npm install --save-dev supertest @types/supertest @faker-js/faker
```

**Frontend** (Already present):
- vitest ✅
- @testing-library/react ✅
- @testing-library/jest-dom ✅
- jest-axe ✅

---

## Approval Checklist

Before proceeding, please review:

- [ ] Implementation strategy is clear
- [ ] Week 1-2 breakdown is achievable
- [ ] Risk mitigations are acceptable
- [ ] Success metrics are realistic
- [ ] File structure makes sense
- [ ] Order of execution is correct
- [ ] Budget of 12-14 hours (Week 1) + 8-10 hours (Week 2) is acceptable

**Ready to proceed?** → Confirm and we'll begin Stage 1A immediately

---

## Notes

This plan follows the QA-TESTING-TODOS.md structure but is tailored to:
1. **Leverage existing configuration** (jest.config.cjs, vitest.config.ts)
2. **Minimize setup overhead** (test framework already installed)
3. **Focus on high-impact tests** (auth, messages, billing)
4. **Build incrementally** (test infrastructure → service tests → integration tests → E2E)
5. **Document as we go** (standards, conventions, setup)

Each stage has clear deliverables and success criteria. Estimated total time: ~22-24 hours across 2 weeks.

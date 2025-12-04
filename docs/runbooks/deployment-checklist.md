# Deployment Checklist - Phase 3 Enhanced Pipeline

**Purpose**: Developer guide to prevent deployment failures and ensure code quality
**Time**: 5-10 minutes before pushing code
**Applies To**: All commits to `main` branch

---

## 🚀 Pre-Push Checklist (Do This Before `git push`)

### 1. Code Quality

- [ ] **Linting passes locally**
  ```bash
  cd backend && npm run lint
  cd ../frontend && npm run lint
  ```
  - If linting fails: `npm run lint -- --fix` to auto-fix
  - Manually fix any issues that can't be auto-fixed

- [ ] **No console errors in development**
  ```bash
  npm run dev  # Run locally, check browser console
  ```
  - Open browser DevTools
  - Verify no ❌ red errors (warnings are ok)

- [ ] **TypeScript compiles without errors**
  ```bash
  cd backend && npm run build
  cd ../frontend && npm run build
  ```
  - No compilation errors before pushing
  - Fixes type issues locally

### 2. Testing

- [ ] **All tests pass locally**
  ```bash
  cd backend && npm test
  cd ../frontend && npm test
  ```
  - 100% pass rate required
  - If tests fail, debug and fix before pushing
  - Don't skip or mock tests

- [ ] **Tests cover your changes**
  - New features should have test cases
  - Existing tests should still pass
  - Edge cases tested if applicable

### 3. Security

- [ ] **No security vulnerabilities**
  ```bash
  cd backend && npm audit
  cd ../frontend && npm audit
  ```
  - No moderate or high vulnerabilities allowed
  - Low vulnerabilities acceptable if documented
  - Command will exit with error if issues found

- [ ] **No hardcoded secrets**
  - No API keys in code
  - No passwords in commits
  - No database credentials
  - Use environment variables only

### 4. Dependencies

- [ ] **No unnecessary new packages**
  - Only add dependencies if required
  - Use `npm ls` to verify no duplicates

- [ ] **lock files committed**
  ```bash
  git status | grep lock
  ```
  - `package-lock.json` must be up to date
  - Commit alongside `package.json` changes

---

## 📝 Commit Message Format

**Good Commit Message**:
```
feat: Add two-factor authentication

- Add TOTP-based 2FA support
- Add recovery codes for account recovery
- Update security tests

Fixes #1234
```

**Format**:
```
<type>: <subject line (50 chars max)>

<body (72 chars per line, explains WHY not WHAT)>

<footer (references issues/PRs)>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (linting, formatting)
- `refactor`: Code refactoring without feature changes
- `test`: Test additions/updates
- `chore`: Dependency updates, config changes

**Examples**:
```bash
# Feature
git commit -m "feat: add message scheduling

Allow users to schedule messages for future delivery"

# Fix
git commit -m "fix: resolve dashboard loading timeout

Reduce initial dashboard query timeout from 30s to 10s"

# Docs
git commit -m "docs: add API authentication guide"

# Chore
git commit -m "chore: update dependencies

- bump express from 4.17 to 4.18
- bump prisma from 3.1 to 3.2"
```

---

## 🔄 Push to Remote

```bash
# Make sure you're on main branch
git branch  # Should show: * main

# Push your commits
git push origin main
```

**What happens next:**
1. GitHub Actions triggered automatically
2. Pipeline runs all quality gates:
   - ✅ Linting (must pass)
   - ✅ Tests (must pass)
   - ✅ Security audit (must pass)
   - ✅ Build (must pass)
3. If all pass: Deploys to production
4. If any fail: ❌ Marked as failed in GitHub, no deployment

---

## 🆘 If Pipeline Fails

### Failure: Linting Error

**GitHub Shows**:
```
❌ Lint backend - Failed
  ESLint reported violations
```

**Your Action**:
```bash
# Fix locally
cd backend && npm run lint -- --fix
git add .
git commit -m "fix: resolve linting errors"
git push origin main
```

### Failure: Test Failure

**GitHub Shows**:
```
❌ Run backend tests - Failed
  3 test failures
```

**Your Action**:
```bash
# Debug locally
cd backend && npm test

# Read error messages carefully
# Fix the broken code or update tests

git add .
git commit -m "fix: resolve failing tests"
git push origin main
```

### Failure: Security Vulnerability

**GitHub Shows**:
```
❌ Run npm audit (Backend) - Failed
  Found 2 moderate severity vulnerabilities
```

**Your Action (Option A - Update Package)**:
```bash
# Update the problematic package
npm update package-name

# Run audit again to verify
npm audit

# Commit and push
git add package.json package-lock.json
git commit -m "chore: update vulnerable dependency"
git push origin main
```

**Your Action (Option B - Investigate Further)**:
```bash
# Check what's vulnerable
npm audit --verbose

# Assess if upgrade is possible
npm update --save  # Try updating all

# If can't fix, discuss with team before pushing
```

### Failure: Build Error

**GitHub Shows**:
```
❌ Build backend - Failed
  TypeScript compilation error
```

**Your Action**:
```bash
# Test build locally
cd backend && npm run build

# Fix TypeScript errors shown
# Common fixes:
#   - Missing type annotations
#   - Wrong property names
#   - Function parameter mismatches

git add .
git commit -m "fix: resolve TypeScript compilation error"
git push origin main
```

---

## ✅ Successful Deployment

**When Pipeline Succeeds**:
```
✅ Lint backend - Passed
✅ Lint frontend - Passed
✅ Build backend - Passed
✅ Build frontend - Passed
✅ Run backend tests - Passed
✅ Run frontend tests - Passed
✅ Run npm audit (Backend) - Passed
✅ Run npm audit (Frontend) - Passed
✅ Security checks - Passed
✅ Trigger Render deployment - Passed
```

**Deployment Complete**:
- Code deployed to production within 2-3 minutes
- Check Render dashboard for live deployment
- Monitor New Relic for any performance issues
- Check Sentry for any new errors

---

## 📊 Quick Reference Table

| Issue | Check Locally | Command | Fix |
|-------|---|---|---|
| Linting | `npm run lint` | `npm run lint -- --fix` | Auto-fix + manual review |
| Tests | `npm test` | Review test output | Fix code or update tests |
| Compilation | `npm run build` | Review error | Fix TypeScript errors |
| Security | `npm audit` | `npm update` | Update packages |

---

## 🎯 Golden Rules

1. **Run checks locally BEFORE pushing**
   - Don't rely on GitHub Actions to find your errors
   - Fix locally is 10x faster than fixing after pipeline

2. **All checks must pass**
   - No `|| true` - you can't skip them anymore
   - This is intentional - improves code quality

3. **One thing per commit**
   - Feature in one commit
   - Fix in another commit
   - Makes history cleaner and easier to revert if needed

4. **Write clear commit messages**
   - Helps future developers understand why change was made
   - Helps in debugging if something goes wrong

5. **Never force-push to main**
   - `git push --force` is disabled
   - Prevents accidental history rewriting

---

## 🔗 Related Documentation

- `docs/runbooks/ci-cd-pipeline.md` - Technical pipeline details
- `docs/runbooks/incidents.md` - What to do if deployment causes issues
- `.github/workflows/deploy.yml` - Actual pipeline configuration

---

## 💡 Pro Tips

### Tip 1: Run Full Check Before Pushing

Create a local shell script to run all checks:

```bash
# File: scripts/pre-push.sh
#!/bin/bash

echo "🔍 Running pre-push checks..."

echo "📦 Linting backend..."
cd backend && npm run lint || exit 1

echo "📦 Linting frontend..."
cd ../frontend && npm run lint || exit 1

echo "🧪 Testing backend..."
cd ../backend && npm test || exit 1

echo "🧪 Testing frontend..."
cd ../frontend && npm test || exit 1

echo "🔒 Security audit backend..."
npm audit --audit-level=moderate || exit 1

echo "🔒 Security audit frontend..."
cd ../frontend && npm audit --audit-level=moderate || exit 1

echo "✅ All checks passed! Safe to push."
```

Then run: `bash scripts/pre-push.sh` before every push

### Tip 2: Use Git Hooks (Advanced)

Auto-run checks before allowing push:

```bash
# Install husky hook manager
npm install husky --save-dev
npx husky install

# Create pre-push hook
npx husky add .husky/pre-push "bash scripts/pre-push.sh"
```

Now checks run automatically before push - can't bypass it!

### Tip 3: VS Code Integration

Install these extensions for real-time feedback:
- **ESLint** - Shows linting issues while you type
- **Prettier** - Auto-formats code on save
- **Jest** - Runs tests in editor

---

**Last Updated**: Phase 3 Implementation
**Status**: Active (enforced from 2025-12-04)
**Questions?**: See `docs/runbooks/ci-cd-pipeline.md` or contact DevOps team


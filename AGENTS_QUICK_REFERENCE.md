# Koinoniasms: AI Agents Quick Reference Guide

## 🚀 Available Slash Commands

You can invoke any of these agents using slash commands. Type the command and your request!

---

## 📊 Product Manager Agent
**Command:** `/product-manager`

**Use for:**
- Market strategy and roadmap planning
- Feature prioritization and business decisions
- User story creation and requirements analysis
- Competitive analysis and market opportunities
- Revenue and growth projections

**Example:**
```
/product-manager

What features should we prioritize for Q1 2026? Should we focus on email integration, analytics, or mobile app?
```

---

## 🎨 UI/UX Agent
**Command:** `/ui-ux`

**Use for:**
- Design review and feedback
- Accessibility audits (WCAG compliance)
- User experience improvements
- Mobile responsiveness testing
- Onboarding flow optimization
- Component design and consistency

**Example:**
```
/ui-ux

Review the AdminSettingsPage for accessibility issues and mobile responsiveness at 375px viewport.
```

---

## 🏗️ System Architecture Agent
**Command:** `/system-architecture`

**Use for:**
- System design for scale
- Architecture decision making
- Technology selection and evaluation
- Scalability analysis
- Database design
- Microservices planning

**Example:**
```
/system-architecture

How should we design the architecture to handle 10x growth? What are the bottlenecks?
```

---

## 💻 Senior Frontend Engineer Agent
**Command:** `/senior-frontend`

**Use for:**
- Frontend code review
- Component architecture assessment
- Performance optimization
- Testing strategy
- React best practices
- Bundle size analysis

**Example:**
```
/senior-frontend

Review the DashboardPage component for performance issues, code quality, and testing gaps.
```

---

## 🔧 Backend Engineer Agent
**Command:** `/backend-engineer`

**Use for:**
- Backend code review
- API design and contracts
- Database query optimization
- Performance analysis
- Business logic validation
- Security review for backend

**Example:**
```
/backend-engineer

Review the SMS sending service for N+1 queries, missing indexes, and performance bottlenecks.
```

---

## ✅ QA Testing Agent
**Command:** `/qa-testing`

**Use for:**
- Test plan creation
- Test case design
- Testing strategy
- Quality assurance planning
- Bug report standards
- Acceptance criteria definition

**Example:**
```
/qa-testing

Create a comprehensive test plan for the email integration feature including all edge cases.
```

---

## 🚀 DevOps Engineer Agent
**Command:** `/devops`

**Use for:**
- CI/CD pipeline design
- Deployment strategy
- Infrastructure planning
- Monitoring and alerting
- Backup and disaster recovery
- Cost optimization

**Example:**
```
/devops

Design a CI/CD pipeline for zero-downtime deployments with staging environment and blue-green strategy.
```

---

## 🔒 Security Analyst Agent
**Command:** `/security`

**Use for:**
- Security audits
- Vulnerability assessment
- Compliance review (GDPR, HIPAA, SOC 2)
- Threat modeling
- Security hardening recommendations
- OWASP Top 10 analysis

**Example:**
```
/security

Conduct a security audit of our authentication system for OWASP Top 10 vulnerabilities.
```

---

## 💡 USAGE TIPS

### Asking Good Questions

**Be specific:**
```
❌ /backend-engineer
Review the backend code

✅ /backend-engineer
Review the message sending service for:
- N+1 query issues
- Missing database indexes
- Caching opportunities
- Performance bottlenecks
```

**Provide context:**
```
❌ /product-manager
What should we build?

✅ /product-manager
We have 1,000 churches and want to grow to 10,000.
What features drive retention? Should we focus on email integration, analytics, or mobile app first?
```

**Ask follow-ups:**
```
/security

I saw your recommendations. Can you prioritize them by impact and timeline?
```

---

## 🎯 COMMON AGENT COMBINATIONS

### For New Feature Development
1. **Product Manager** - Define the feature and business case
2. **System Architect** - Design the architecture
3. **Backend Engineer** - Review API and database design
4. **Senior Frontend** - Review UI component design
5. **QA Testing** - Create test plan
6. **Security** - Audit for vulnerabilities

### For Performance Issues
1. **Backend Engineer** - Find database bottlenecks
2. **Senior Frontend** - Profile rendering performance
3. **System Architect** - Identify scaling issues
4. **DevOps** - Review infrastructure metrics
5. **Security** - Check for security-induced slowdowns

### For Scaling to 10x
1. **System Architect** - Design for scale
2. **Backend Engineer** - Optimize services
3. **DevOps** - Plan infrastructure
4. **Security** - Hardening for enterprise
5. **Product Manager** - Monetize at scale

### For Launch Readiness
1. **Security** - Final security audit
2. **QA Testing** - Comprehensive test plan
3. **DevOps** - Deployment checklist
4. **Senior Frontend** - Code quality review
5. **Product Manager** - Go/no-go decision

---

## 📈 AGENT CAPABILITIES

| Agent | Strengths | Best For |
|-------|-----------|----------|
| **Product Manager** | Strategic thinking, market analysis | Business decisions |
| **UI/UX** | User experience, design systems | User satisfaction |
| **System Architect** | Scalability, reliability | Growth planning |
| **Senior Frontend** | React, performance, testing | Code quality |
| **Backend Engineer** | APIs, databases, optimization | System performance |
| **QA Testing** | Test planning, quality metrics | Risk reduction |
| **DevOps** | Deployment, monitoring, reliability | Operational excellence |
| **Security** | Vulnerability detection, compliance | Risk mitigation |

---

## 🚀 GETTING THE MOST FROM AGENTS

### 1. **Be Conversational**
Agents respond better to natural language:
```
/backend-engineer

I'm worried about database performance with 10x growth.
Which queries are the bottleneck? What indexes are missing?
How can we optimize without rewriting everything?
```

### 2. **Ask for Specific Outputs**
Tell agents what format you want:
```
/qa-testing

Create a test plan with:
- Test cases (30+ cases)
- Preconditions and steps
- Expected results
- Severity levels (Critical/High/Medium/Low)
- Estimated test execution time
```

### 3. **Provide Your Context**
Share relevant information:
```
/system-architect

Current: 1,000 churches, 60 msg/min, PostgreSQL on Render
Target: 10,000 churches, 6,000 msg/min, 99.95% uptime
Constraints: $85K budget, need zero-downtime deployments

What's the recommended architecture?
```

### 4. **Request Prioritization**
Ask agents to help you decide:
```
/product-manager

Here are 5 potential features:
1. Email integration
2. Analytics dashboard
3. Message scheduling
4. Planning Center sync
5. Mobile app

Which 2 should we build in Q1 2026 to maximize revenue growth?
```

### 5. **Ask for Actionable Steps**
Get a roadmap, not just analysis:
```
/devops

Create a 12-week plan to implement:
- CI/CD automation
- Staging environment
- Blue-green deployments
- Datadog monitoring

Include: Week-by-week timeline, tools needed, estimated effort
```

---

## 📚 REFERENCE DOCUMENTS

All agent analyses are saved in these files:

**Master Roadmap:**
- `COMPREHENSIVE_SAAS_UPGRADE_ROADMAP.md` - Complete strategic overview

**Detailed Guides:**
- `DEVOPS_INFRASTRUCTURE_STRATEGY.md` - CI/CD, deployment, monitoring
- `10DLC_DELIVERY_TIER_TEST_PLAN.md` - 41 test cases for current feature

**Agent Configs:**
- `.claude/agents/` - Agent definitions
- `.claude/commands/` - Slash command definitions

---

## 🎓 LEARNING RESOURCES

### Understanding Each Agent's Methodology

Each agent has its own approach:

**Product Manager** uses:
- RICE scoring (Reach × Impact × Confidence / Effort)
- User story format (As a..., I want..., So that...)
- MoSCoW prioritization (Must, Should, Could, Won't)

**Backend Engineer** uses:
- Code review patterns
- Performance profiling
- Architecture decision records (ADRs)

**Security Analyst** uses:
- OWASP Top 10 framework
- CVSS scoring
- Threat modeling

...and so on. Each agent brings industry best practices.

---

## ⚡ QUICK COMMANDS CHEAT SHEET

```bash
# Market and Strategy
/product-manager

# User Experience
/ui-ux

# System Design
/system-architecture

# Frontend Code
/senior-frontend

# Backend Code
/backend-engineer

# Quality Assurance
/qa-testing

# Operations
/devops

# Security
/security
```

---

## 🎯 NEXT STEPS

1. **Pick an agent** based on your current need
2. **Ask a specific question** with context
3. **Get detailed analysis** tailored to your situation
4. **Follow up** with clarifications or next steps
5. **Reference the documents** for strategic context

---

## 💬 EXAMPLE CONVERSATION

```
You: /product-manager
What should our Q1 2026 roadmap look like?

Agent: (Provides detailed feature analysis...)

You: /backend-engineer
Can you review if the architecture supports that roadmap?

Agent: (Reviews and provides optimization suggestions...)

You: /security
Are there any security risks in that roadmap?

Agent: (Identifies risks and provides hardening plan...)

You: /product-manager
Given the security requirements and backend constraints,
which features should we prioritize?

Agent: (Refined prioritization with business impact...)
```

---

## 🚀 YOU NOW HAVE

✅ 8 specialized agents ready to help
✅ Quick-reference guide (this document)
✅ Detailed analysis documents
✅ Implementation roadmap
✅ Strategic guidance on growth

**Start with any `/command` and get expert guidance tailored to your needs!**

---

**Last Updated:** November 23, 2025
**Status:** All agents active and ready for deployment

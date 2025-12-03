# Privacy Policy - Koinonia YW Platform

**Effective Date**: December 3, 2025
**Last Updated**: December 3, 2025
**Version**: 1.0

---

## 1. Data Controller & Contact Information

**Organization**: Koinonia YW Platform
**Email**: privacy@koinoniasms.com
**Address**: [Your Organization Address]
**Data Protection Officer**: [DPO Name/Email]

---

## 2. Overview

Koinonia YW Platform ("**the Platform**") is a church communication and SMS messaging service designed to help churches manage member communications. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.

**Key Principle**: We only collect information necessary to provide our service and comply with legal obligations. We never sell your data to third parties.

---

## 3. Information We Collect

### 3.1 Account Information
When you create an account, we collect:
- **Email address** (encrypted at rest)
- **First and last name**
- **Church name**
- **Church phone number** (encrypted at rest)
- **Password** (hashed with bcrypt, never stored in plaintext)

### 3.2 Member Data
When you upload member information to send messages:
- **Phone numbers** (encrypted with AES-256-GCM)
- **Email addresses** (encrypted at rest)
- **First and last names**
- **Custom fields** you define (groups, tags, attributes)

### 3.3 Message Data
We store:
- **Message content** (encrypted at rest)
- **Delivery status** (sent, failed, bounced)
- **Timestamps** of message send/delivery
- **Recipient information** (which members received which messages)
- **Conversation history** (SMS replies)

### 3.4 Billing & Payment Data
We collect:
- **Stripe Customer ID** (reference, not card details)
- **Subscription plan** and billing email
- **Billing address** and payment method (processed by Stripe, we don't store it)
- **Invoice history**

### 3.5 Technical Data
- **IP address** (for rate limiting and security)
- **User agent** and browser information
- **Login timestamps** and failed login attempts
- **API usage data** (for billing and performance monitoring)

### 3.6 Audit Logging
We automatically log:
- **Login events** (successful and failed)
- **Data export requests**
- **Data deletion requests**
- **Permission changes**
- **Admin actions**

---

## 4. Legal Basis for Processing (GDPR - Article 6)

We process your personal data based on:

| Data Type | Legal Basis | Purpose |
|-----------|------------|---------|
| Account info | **Consent** | Signup, account management |
| Member data | **Contract** | Provide SMS messaging service |
| Message content | **Contract** | Send messages you request |
| Billing data | **Contract** | Payment processing, invoicing |
| IP logs | **Legitimate Interest** | Security, fraud prevention |
| Audit logs | **Legal Obligation** | GDPR compliance, breach notification |

---

## 5. How We Use Your Information

### 5.1 To Provide the Service
- Send SMS/MMS messages on your behalf
- Store and retrieve conversation history
- Manage your groups and member lists
- Track message delivery status

### 5.2 For Security & Fraud Prevention
- Monitor suspicious login attempts
- Detect unusual message patterns (spam/phishing)
- Prevent unauthorized access
- Verify your identity

### 5.3 For Compliance & Legal Obligations
- Maintain audit trails for GDPR Article 30
- Respond to legal requests from authorities
- Prevent abuse of the platform
- 7-year retention for compliance

### 5.4 Service Improvements
- Analyze usage patterns (anonymized)
- Identify bugs and performance issues
- Improve user interface and experience

### 5.5 Communication
- Service updates and notifications
- Billing information and receipts
- Security alerts

**We do NOT**:
- ❌ Sell your data to advertisers
- ❌ Use your data for marketing to third parties
- ❌ Train AI models on your data
- ❌ Share data with non-essential third parties
- ❌ Retain data longer than necessary

---

## 6. Data Sharing & Third-Party Processors

We share data **ONLY** with these verified processors:

### 6.1 Stripe
**Purpose**: Payment processing
**Data Shared**: Stripe Customer ID, billing email, subscription status (NOT card details)
**Status**: PCI-DSS Level 1 certified
**DPA**: Yes - signed

### 6.2 Telnyx
**Purpose**: SMS/MMS delivery
**Data Shared**: Phone numbers, message content, delivery status
**Status**: SOC 2 Type II certified
**DPA**: Yes - signed

### 6.3 Render
**Purpose**: Hosting and infrastructure
**Data Shared**: All application data (encrypted)
**Status**: SOC 2 Type II certified
**DPA**: Yes - signed

### 6.4 Sentry
**Purpose**: Error tracking and monitoring
**Data Shared**: Error logs, IP addresses (anonymized)
**Status**: GDPR compliant
**DPA**: Yes - signed

**No other third parties** have access to your data.

---

## 7. Your Rights (GDPR Articles 15-22)

### 7.1 Right of Access (Article 15)
You can request and download all your personal data in machine-readable format (JSON).
**Endpoint**: `POST /api/gdpr/export`
**Response Time**: 30 days

### 7.2 Right to Erasure - "Right to be Forgotten" (Article 17)
You can request permanent deletion of all your data and account.
**Endpoint**: `DELETE /api/gdpr/delete-all`
**Note**: Requires password confirmation and "DELETE ALL DATA" confirmation text
**Response Time**: Immediately (cascading deletion)

### 7.3 Right to Rectification (Article 16)
You can correct inaccurate personal data in your account settings.
**Method**: Update your profile at any time

### 7.4 Right to Data Portability (Article 20)
You can export your data in CSV format.
**Endpoint**: `GET /api/gdpr/export-csv`
**Format**: CSV (Excel compatible)

### 7.5 Right to Object (Article 21)
You can object to specific processing.
**Contact**: privacy@koinoniasms.com

### 7.6 Right to Restrict Processing (Article 18)
You can request we stop processing your data (we'll stop sending messages).
**Contact**: privacy@koinoniasms.com

---

## 8. Data Retention Policy

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| **Active Account Data** | While subscription active | Service provision |
| **Canceled Account Data** | 30 days | Right to restore within grace period |
| **Audit/Security Logs** | 7 years | GDPR Article 30 compliance |
| **Deleted Messages** | Deleted immediately | User request |
| **Failed Login Attempts** | 90 days | Security monitoring |
| **Backups** | 30 days | Disaster recovery |

**Automatic Deletion**:
- When you delete your account, all data is removed from production within 24 hours
- Backups containing deleted data are kept for 30 days then destroyed
- Encryption keys are rotated quarterly

---

## 9. Data Security Measures

### 9.1 Encryption
- **At Rest**: AES-256-GCM encryption for PII (email, phone, SMS content)
- **In Transit**: TLS 1.3 (HTTPS) for all connections
- **Backups**: PostgreSQL encrypted backups (Render default)

### 9.2 Access Control
- **Authentication**: JWT tokens with 15-minute expiry + 7-day refresh
- **Authorization**: Role-based access control (RBAC)
- **Multi-Tenancy**: Church data strictly isolated via churchId
- **MFA**: Optional Google Authenticator for admin accounts

### 9.3 Monitoring
- **Rate Limiting**: Blocks brute force attempts (5 logins per 15 min)
- **Audit Logging**: All sensitive operations logged
- **Anomaly Detection**: Unusual message volumes flagged
- **Real-time Alerts**: Security events monitored 24/7

### 9.4 Infrastructure
- **Network**: Render's DDoS protection and firewall
- **Database**: PostgreSQL on encrypted disks
- **Secrets**: Environment variables only (no hardcoded credentials)
- **Updates**: Automated security patching via Dependabot

---

## 10. Data Breach Notification

If a data breach occurs:
1. **Within 72 hours**: We notify all affected users via email
2. **Notice Includes**: What data was breached, what we're doing about it, how to protect yourself
3. **Authority Notification**: We notify relevant data protection authorities
4. **Remediation**: We implement additional protections to prevent recurrence

---

## 11. International Data Transfers

**Jurisdiction**: United States (Render hosting)

**For EU Users (GDPR)**:
- Data transfers are protected by **Standard Contractual Clauses (SCCs)**
- Render provides GDPR-compliant infrastructure
- We've conducted Transfer Impact Assessment (TIA) per Schrems II

**For Other Regions**:
- We comply with local data protection laws
- Contact us if you have jurisdiction-specific concerns

---

## 12. Children's Privacy

Our Platform is **NOT directed to children under 13**. We do not knowingly collect personal information from children. If we become aware that we've collected data from a child, we'll delete it immediately.

---

## 13. California Residents (CCPA/CPRA)

California residents have additional rights:

- **Right to Know**: What personal information is collected and used
- **Right to Delete**: Request deletion (see Article 17 above)
- **Right to Opt-Out**: Object to sale of personal information (we don't sell)
- **Right to Correct**: Request we correct inaccurate information
- **Right to Non-Discrimination**: We won't discriminate for exercising rights

**Your Choices**:
- Manage preferences: Account settings
- Opt-out of processing: Contact privacy@koinoniasms.com
- Request verification: privacy@koinoniasms.com

---

## 14. Cookies & Tracking

### 14.1 Cookies We Use
- **accessToken**: HTTP-only cookie, 15-minute expiry (authentication)
- **refreshToken**: HTTP-only cookie, 7-day expiry (session persistence)
- **csrfToken**: CSRF protection (not stored as cookie)

### 14.2 Cookies We DON'T Use
- ❌ No marketing/tracking cookies
- ❌ No third-party advertising pixels
- ❌ No analytics cookies (except anonymized errors via Sentry)

### 14.3 Analytics
We use **PostHog** for anonymized analytics:
- No personal identifying information
- No IP address tracking (anonymized)
- No cross-site tracking
- You can opt-out in user settings

---

## 15. Changes to This Privacy Policy

We may update this policy to reflect legal changes or service improvements. We'll notify you of material changes via:
- Email notification
- In-app notice
- Banner on this page

**Current Version**: 1.0 (December 3, 2025)

---

## 16. Contact & Complaints

### For Privacy Questions
📧 **Email**: privacy@koinoniasms.com
🌐 **Web**: [Your website]/privacy

### For Complaints
If you believe we've violated your privacy rights:

1. **Contact Us First**: privacy@koinoniasms.com
2. **Request Resolution**: We'll respond within 30 days
3. **Escalate to Regulator**:
   - **EU**: Your national Data Protection Authority
   - **UK**: UK Information Commissioner's Office (ICO)
   - **California**: California Attorney General
   - **Other**: Your local regulatory authority

### Data Subject Access Request
To request your personal data:
- **Email**: privacy@koinoniasms.com
- **Subject**: "Data Subject Access Request (DSAR)"
- **Include**: Your full name, email, and what data you want
- **Response Time**: Within 30 days

---

## 17. Specific Clauses for Different Regions

### GDPR (EU/EEA/UK)
✅ **Compliant**
- Data Processing Agreement signed with all processors
- Transfers protected by Standard Contractual Clauses
- Data Protection Impact Assessment (DPIA) completed
- Privacy by Design implemented
- Legitimate Interests Assessment (LIA) performed

### CCPA/CPRA (California)
✅ **Compliant**
- Service Provider relationships documented
- Consumer rights clearly explained
- Opt-out mechanisms provided
- Data retention schedule published

### LGPD (Brazil)
✅ **Compliant**
- Data protection terms in Portuguese (available upon request)
- Legal basis clearly stated
- Data controller contact provided
- Resident rights respected

---

## 18. Summary Table: What Happens to Your Data

| Scenario | Timeline | What Happens |
|----------|----------|-------------|
| **Active Subscriber** | While paying | Data securely stored, encrypted, backed up daily |
| **Cancel Subscription** | 30-day grace period | Data retained in case you want to restore |
| **Request Export (GDPR)** | Immediately | Download JSON file with all your data |
| **Request Deletion (GDPR)** | 24 hours | All data deleted, backups destroyed within 30 days |
| **Breach Occurs** | 72 hours | You're notified via email with details |
| **Server Incident** | Varies | Render automatically handles failover, data safe |
| **Account Hacked** | On discovery | We lock account, reset password, log all actions |
| **Audit/Compliance** | Ongoing | Logs kept for 7 years, never shared with third parties |

---

**This Privacy Policy is effective as of December 3, 2025. We reserve the right to modify this policy at any time with notice to users.**


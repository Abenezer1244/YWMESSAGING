# Privacy Policy - GDPR Compliant

**Last Updated**: December 2, 2024
**Effective Date**: January 1, 2025
**Version**: 2.0 (GDPR Compliant)

---

## 1. INTRODUCTION

Koinoniasms ("**we**", "**us**", "**our**", or "**Company**") provides a cloud-based messaging and communication platform ("**Service**") for churches and religious organizations.

We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains:
- What personal data we collect
- How we use that data
- Your rights regarding your data
- How we protect your data

### Scope

This Privacy Policy applies to all users of Koinoniasms, including:
- Church administrators
- Church members
- Subscribers
- Visitors to our website

---

## 2. DATA WE COLLECT

### 2.1 Information You Provide

**Church Administration Data**:
- Name, email, phone number
- Church name and location
- Administrative roles and permissions
- Billing and payment information
- Church configuration preferences

**Member Data**:
- Member name, phone number, email
- Group/branch assignments
- Opt-in status for SMS/email communication
- Message delivery history

**Message Data**:
- SMS and MMS message content
- Delivery status and timestamps
- Sender and recipient information
- Media attachments

**Support Data**:
- Inquiries and support requests
- Feedback and feature requests
- Usage questions and documentation

### 2.2 Automatically Collected Data

**Usage Analytics**:
- API access logs (IP address, endpoint, timestamp)
- Feature usage patterns
- Dashboard interactions
- Performance metrics

**Technical Data**:
- Device information
- Browser type and version
- Operating system
- Cookie and tracking IDs

**Security Data**:
- Login attempts and authentication events
- IP addresses from login attempts
- Admin actions and changes
- Data access logs

### 2.3 Data from Third Parties

- **SMS Provider** (Telnyx): Phone number validity, delivery status
- **Payment Processor** (Stripe): Billing information, transaction history
- **Cloud Infrastructure** (Render): Server logs, performance metrics

---

## 3. HOW WE USE YOUR DATA

### 3.1 Service Delivery

We process your data to:
- ✅ Deliver SMS/MMS messages
- ✅ Manage your account and profile
- ✅ Process billing and subscriptions
- ✅ Provide customer support
- ✅ Track message delivery status

**Legal Basis**: Contract (necessary for service)

### 3.2 Safety & Security

We process your data to:
- ✅ Detect fraud and abuse
- ✅ Prevent unauthorized access
- ✅ Enforce terms of service
- ✅ Comply with legal obligations
- ✅ Respond to legal requests

**Legal Basis**: Legitimate interest (security) + Legal obligation

### 3.3 Analytics & Improvement

We process your data to:
- ✅ Improve our service
- ✅ Analyze usage patterns (anonymized)
- ✅ Develop new features
- ✅ Optimize performance

**Legal Basis**: Legitimate interest

### 3.4 Communication

We process your data to:
- ✅ Send service notifications
- ✅ Provide support responses
- ✅ Send billing updates
- ✅ Announce new features
- ✅ Important security alerts

**Legal Basis**: Legitimate interest + Consent (for marketing)

### 3.5 WHAT WE DO NOT DO

- ❌ We do NOT sell your data
- ❌ We do NOT share data with advertisers
- ❌ We do NOT use data for unauthorized marketing
- ❌ We do NOT process data beyond stated purposes

---

## 4. DATA RETENTION

### 4.1 Active Account Data

**Retention Period**: For duration of account + 30 days after deletion

**Data Retained**:
- Church information
- Member data
- Message history
- Billing records
- Configuration settings

### 4.2 Account Deletion

When an account is deleted (via GDPR deletion request):
- ✅ All data deleted immediately (atomic transaction)
- ✅ No data remains accessible
- ✅ Deletion irreversible after 30-day grace period
- ✅ Audit trail maintained (anonymized)

### 4.3 Backup Data

**Retention**: 90-180 days (daily automated backups)

Backups contain encrypted copies of your data:
- Used for disaster recovery only
- Not accessible for other purposes
- Automatically deleted after retention period
- Encrypted at rest and in transit

### 4.4 Logs & Analytics

**Retention**: 90 days (in Datadog)

Logged data includes:
- API access logs
- Error logs
- Security events
- Performance metrics

- **Anonymized** when possible
- **Encrypted** in transit and at rest
- **Searchable** for compliance audits

### 4.5 Legal Holds

If required by law, we may retain data beyond normal retention periods:
- Court orders
- Regulatory investigations
- Legal disputes
- We will notify you when possible

---

## 5. DATA SECURITY

### 5.1 Encryption

**In Transit**:
- ✅ HTTPS/TLS for all API traffic
- ✅ End-to-end encryption for sensitive data
- ✅ Certificate pinning to prevent MITM attacks

**At Rest**:
- ✅ AES-256 encryption of database
- ✅ Encrypted backups
- ✅ Encrypted log storage
- ✅ Secure key management

### 5.2 Access Control

- ✅ Authentication required for all API access
- ✅ JWT token-based authorization
- ✅ Role-based access control (RBAC)
- ✅ API key rotation recommended
- ✅ Multi-factor authentication (MFA) available

### 5.3 Infrastructure Security

- ✅ ISO 27001 compliant hosting (Render)
- ✅ DDoS protection
- ✅ Firewall and security groups
- ✅ Regular security audits
- ✅ Automated backups with encryption
- ✅ Disaster recovery (failover capability)

### 5.4 Monitoring & Auditing

- ✅ Real-time log monitoring (Datadog)
- ✅ Alert system for suspicious activity
- ✅ 90-day audit trail maintained
- ✅ Access logging for all admin actions
- ✅ Security event tracking

### 5.5 Vulnerability Management

- ✅ Regular security testing
- ✅ Dependency vulnerability scanning
- ✅ Promptly patched vulnerabilities
- ✅ Security incident response plan
- ✅ Bug bounty program (coming soon)

---

## 6. YOUR PRIVACY RIGHTS (GDPR)

### 6.1 Right to Access (Article 15)

You have the right to request:
- A copy of all your personal data
- Format: JSON (machine-readable, portable)
- Timeline: Within 30 days
- **How**: POST `/api/gdpr/export` endpoint
- **Free**: No charge for requests

### 6.2 Right to Rectification (Article 16)

You have the right to:
- Correct inaccurate data
- Complete incomplete data
- **How**: Update via admin dashboard or API
- **Timeline**: Immediate

### 6.3 Right to Erasure (Article 17)

You have the right to request deletion ("Right to be Forgotten"):
- All personal data deleted
- 30-day grace period to cancel
- Irreversible after grace period
- **How**: POST `/api/gdpr/delete-account/request` endpoint
- **Timeline**: Deleted after 30 days if confirmed

### 6.4 Right to Restrict Processing (Article 18)

You have the right to:
- Restrict processing of your data
- Data retained but not processed
- **How**: Contact support@koinoniasms.com
- **Timeline**: Within 30 days

### 6.5 Right to Data Portability (Article 20)

You have the right to receive your data:
- In structured, machine-readable format (JSON)
- And transmit to another service
- **How**: Use POST `/api/gdpr/export` endpoint
- **Timeline**: Within 30 days

### 6.6 Right to Object (Article 21)

You have the right to object to:
- Marketing communications
- Profiling or analytics
- **How**: Manage consent settings in dashboard
- **Timeline**: Immediately

### 6.7 Right to Withdraw Consent (Article 7)

You have the right to withdraw consent:
- For any processing you previously consented to
- No penalty for withdrawal
- **How**: POST `/api/gdpr/consent/{type}` endpoint
- **Effect**: Immediate

### 6.8 Rights Related to Automated Decision Making (Article 22)

- ✅ No fully automated decisions made about you
- ✅ No profiling for credit decisions
- ✅ Manual review available if needed

### 6.9 How to Exercise Your Rights

**Method 1: Self-Service via API**
- Access data: `POST /api/gdpr/export`
- Delete account: `POST /api/gdpr/delete-account/request`
- Manage consent: `POST /api/gdpr/consent/:type`

**Method 2: Submit Request**
- Email: privacy@koinoniasms.com
- Phone: +1-XXX-XXX-XXXX
- Response time: Within 30 days (GDPR requirement)

**Method 3: Contact Data Protection Officer (DPO)**
- Email: dpo@koinoniasms.com
- Escalation path for complex requests

### 6.10 Lodging Complaints

If you believe we violate your privacy rights:
- Contact your local data protection authority
- U.S. States: State Attorney General
- EU: Your country's DPA (https://edpb.ec.europa.eu/)
- UK: Information Commissioner's Office (ICO)

---

## 7. DATA TRANSFERS

### 7.1 Where We Store Data

**Primary Location**: United States (Render data centers in Oregon)

**Why**:
- Low latency for majority of users
- Secure infrastructure
- Compliance with US data protection laws

### 7.2 International Transfers

If data is transferred internationally:
- ✅ Standard Contractual Clauses (SCCs) in place
- ✅ Data Protection Impact Assessment (DPIA) completed
- ✅ Transfers only to adequately protected countries
- ✅ Adequate safeguards in place

### 7.3 EU Users

For EU residents:
- Data transferred under Standard Contractual Clauses (SCCs)
- GDPR fully enforced
- Right to lodge complaint with DPA
- Adequacy assessment available upon request

---

## 8. COOKIES & TRACKING

### 8.1 Session Cookies

We use:
- **Session token**: Authenticate API requests (necessary)
- **CSRF token**: Prevent cross-site attacks (necessary)
- **Preferences**: Remember your dashboard settings (optional)

**Expiration**: Sessions expire after 24 hours of inactivity

### 8.2 Analytics Tracking

We use PostHog for:
- Feature usage analytics
- Performance monitoring
- Bug detection
- User behavior analysis

**Data Collected**:
- Button clicks, page views
- Feature usage patterns
- Error events

**Data NOT Collected**:
- Message content
- Personal information
- Passwords or API keys
- Payment information

### 8.3 Third-Party Tracking

We do NOT use:
- ❌ Google Analytics
- ❌ Facebook pixels
- ❌ Advertising trackers
- ❌ Retargeting cookies

### 8.4 Managing Cookies

You can:
- Disable cookies in browser settings
- Use privacy mode / incognito browsing
- Opt out of analytics via dashboard
- Request cookie list via privacy@koinoniasms.com

---

## 9. CHILDREN'S PRIVACY

Koinoniasms is NOT intended for children under 13 years old:
- We do NOT knowingly collect data from children
- If we discover child data, we delete immediately
- Parents/guardians can request deletion
- Contact: privacy@koinoniasms.com

**Exception**: Parental/guardian accounts may manage children's messaging through proper channels (with parental consent).

---

## 10. CHANGES TO THIS PRIVACY POLICY

### 10.1 When We Update

We will update this policy:
- For legal/regulatory changes (notify within 30 days)
- For new features (notify via email)
- For material changes (obtain new consent)

### 10.2 How We Notify

- Email notification to registered address
- Dashboard notification upon login
- Updated "Last Modified" date
- 30-day advance notice for material changes

### 10.3 Your Rights

- You can review changes before accepting
- Material adverse changes require opt-in
- Continued use = acceptance (unless opted out)
- Right to delete account if disagree with changes

---

## 11. CONTACT INFORMATION

### 11.1 Data Protection Officer (DPO)

**Email**: dpo@koinoniasms.com

For:
- Privacy rights requests
- GDPR compliance questions
- Data breach reports
- Escalated privacy concerns

### 11.2 Privacy Team

**Email**: privacy@koinoniasms.com

For:
- Privacy questions
- Cookie requests
- Data access requests
- General inquiries

### 11.3 Support

**Email**: support@koinoniasms.com
**Phone**: +1-XXX-XXX-XXXX
**Hours**: Monday-Friday, 9 AM - 5 PM PST

### 11.4 Company Address

Koinoniasms, Inc.
[Address TBD]
Seattle, WA [ZIP TBD]
United States

### 11.5 Response Times

- **Data Subject Rights**: 30 days (GDPR requirement)
- **Privacy Inquiries**: 5 business days
- **Urgent Issues**: 24 hours
- **GDPR Violations**: 72 hours (breach notification)

---

## 12. COMPLIANCE FRAMEWORKS

### 12.1 GDPR (EU General Data Protection Regulation)
- ✅ Full GDPR compliance
- ✅ Standard Contractual Clauses for transfers
- ✅ Data Protection Impact Assessment completed
- ✅ DPO appointed
- ✅ 90-day audit trail maintained

### 12.2 CCPA (California Consumer Privacy Act)
- ✅ Consumer rights implemented
- ✅ Data disclosure available
- ✅ Deletion mechanism provided
- ✅ Opt-out for sales (we don't sell)

### 12.3 LGPD (Brazilian Data Protection Law)
- ✅ User consent obtained
- ✅ Data processing purposes disclosed
- ✅ Deletion rights available
- ✅ Transfer restrictions respected

### 12.4 SOC 2 Type II
- ✅ Security controls verified
- ✅ Availability and monitoring
- ✅ Data protection mechanisms
- ✅ Annual audit completion

### 12.5 ISO 27001
- ✅ Information security standards
- ✅ Risk management process
- ✅ Access control policies
- ✅ Encryption implementation

---

## 13. SPECIAL CATEGORIES OF DATA

### 13.1 Religious Information

Church member data may include:
- Religious affiliation/preferences
- Church group membership
- Religious event participation

**Special Protection**:
- ✅ Explicit consent required
- ✅ Enhanced security measures
- ✅ Restricted access
- ✅ Audit logging

### 13.2 Processing Legal Basis

- **Consent**: For religious data processing
- **Contract**: For service delivery
- **Legitimate Interest**: For security and analytics
- **Legal Obligation**: For compliance and law

---

## 14. DATA BREACH NOTIFICATION

### 14.1 If We Experience a Breach

We will:
1. **Investigate** immediately
2. **Contain** the breach
3. **Notify you** within 72 hours
4. **Provide**: Details of breach and impact
5. **Offer**: Free monitoring or remediation if applicable

### 14.2 What Happens

- **Authorities Notified**: Relevant data protection authorities
- **Regulators Informed**: If required by law
- **Communications**: Email + dashboard notification
- **Documentation**: Breach report available upon request

---

## 15. DEFINITIONS

- **Personal Data**: Any information relating to an identified or identifiable person
- **Processing**: Any operation performed on personal data
- **Controller**: Entity determining processing purposes (Koinoniasms)
- **Processor**: Entity processing data on behalf of controller
- **Data Subject**: Individual to whom personal data relates
- **Consent**: Freely given, specific, informed, unambiguous agreement
- **Legitimate Interest**: Balancing test for processing without consent

---

## 16. ACKNOWLEDGMENT

By using Koinoniasms, you acknowledge that:
- ✅ You have read this Privacy Policy
- ✅ You understand our data practices
- ✅ You consent to data processing as described
- ✅ You understand your privacy rights
- ✅ You can request changes at any time

---

## 17. VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Dec 2, 2024 | GDPR compliance, privacy rights, encryption |
| 1.0 | TBD | Original privacy policy |

---

**Last Updated**: December 2, 2024
**Effective Date**: January 1, 2025
**Status**: READY FOR DEPLOYMENT ✅

---

## APPENDIX: DATA PROCESSING SCHEDULE

### Attached: Data Processing Agreement (DPA)

For EU customers, a Data Processing Agreement is attached:
- Standard Contractual Clauses
- Processing details
- Sub-processor list
- Data transfer mechanisms

**Location**: `/legal/dpa.pdf`

---

**For questions or to exercise your rights:**

**Data Protection Officer**: dpo@koinoniasms.com
**Privacy Team**: privacy@koinoniasms.com
**Support**: support@koinoniasms.com


# Data Processing Agreement (DPA)

**Effective Date**: December 3, 2025
**Version**: 1.0
**Applicable To**: GDPR (EU/EEA/UK), CCPA (California), LGPD (Brazil)

---

## 1. Parties

**Data Controller** ("You"):
- Customer of Koinonia YW Platform
- Determines the purpose and means of processing member data

**Data Processor** ("Us"):
- Koinonia YW Platform
- Email: privacy@koinoniasms.com
- Address: [Your Company Address]

---

## 2. Scope of Processing

### 2.1 Processed Data Categories
The Processor processes the following personal data on behalf of the Controller:

| Data Category | Examples | Encryption |
|---------------|----------|-----------|
| **Contact Information** | Names, email addresses, phone numbers | AES-256-GCM at rest, TLS 1.3 in transit |
| **Message Content** | SMS/MMS text, media attachments | AES-256-GCM at rest |
| **Behavioral Data** | Message delivery status, read receipts | Plain text (technical necessity) |
| **Technical Data** | IP addresses, device identifiers | Logged for 90 days |
| **Audit Trail** | Login events, data exports, deletions | Encrypted, 7-year retention |

### 2.2 Purpose of Processing
- Send SMS/MMS messages on behalf of the Controller
- Store and manage member contact lists
- Track message delivery and engagement
- Maintain audit trails for compliance
- Provide customer support and billing

### 2.3 Duration of Processing
- **While subscription active**: Continuous processing
- **After cancellation**: 30-day retention period
- **After deletion request**: Immediate deletion within 24 hours
- **Audit logs**: 7 years (required by law)

### 2.4 Processing Location
- **Primary**: United States (Render hosting, Virginia data center)
- **Backups**: Render-managed redundancy
- **No transfers to third countries** without explicit authorization

---

## 3. Processing Activities

### 3.1 What the Processor Does

The Processor shall:
- ✅ Receive and store member data securely
- ✅ Encrypt sensitive data at rest (AES-256-GCM)
- ✅ Transmit messages to Telnyx for delivery
- ✅ Maintain audit logs of all operations
- ✅ Provide backup and disaster recovery
- ✅ Monitor system security 24/7
- ✅ Apply security patches and updates automatically

### 3.2 What the Processor Will NOT Do

The Processor shall NOT:
- ❌ Use data for any purpose other than providing the Service
- ❌ Share data with third parties (except authorized sub-processors)
- ❌ Sell data to advertisers or data brokers
- ❌ Train machine learning models on the data
- ❌ Combine data from multiple customers
- ❌ Retain data longer than contracted
- ❌ Transfer data without explicit authorization

### 3.3 Authorized Sub-Processors

The Processor uses only these sub-processors for processing:

| Sub-Processor | Function | Legal Basis |
|---------------|----------|------------|
| **Stripe** | Payment processing | Data Processing Agreement |
| **Telnyx** | SMS/MMS delivery | Data Processing Agreement |
| **Render** | Cloud hosting/infrastructure | Data Processing Agreement |
| **Sentry** | Error logging (anonymized) | Data Processing Agreement |

**Process for Adding Sub-Processors**:
1. Processor notifies Controller 30 days before change
2. Controller can object within 15 days
3. If Controller objects, either party can terminate without penalty

---

## 4. Data Subject Rights

### 4.1 Right of Access (GDPR Article 15)
**Service**: `POST /api/gdpr/export`
- Controller can request all member data
- Processor returns complete data export within 30 days
- Format: JSON, machine-readable, portable

### 4.2 Right to Erasure (GDPR Article 17)
**Service**: `DELETE /api/gdpr/delete-all`
- Controller can request complete deletion
- All data deleted immediately (within 24 hours)
- Cascading deletes ensure no orphaned records
- Audit logs may be retained for compliance (7 years)

### 4.3 Right to Rectification (GDPR Article 16)
- Controller is responsible for updating member data
- Processor does not verify/correct data accuracy
- Controller must request corrections through API or contact support

### 4.4 Right to Restrict Processing (GDPR Article 18)
- Controller can request temporary halt of message sending
- Processor will suspend but retain data
- `PUT /api/members/:id/suspend` endpoint available

### 4.5 Right to Data Portability (GDPR Article 20)
**Service**: `GET /api/gdpr/export-csv`
- Export in standard format (CSV)
- All member records portable to other services
- No delay or unreasonable fees

### 4.6 Rights Related to Automated Decision-Making (GDPR Article 22)
- **Not Applicable**: Processor does not make automated decisions about individuals
- No profiling, no scoring, no algorithmic decisions affecting members

---

## 5. Security Measures

### 5.1 Encryption
- **At Rest**: AES-256-GCM symmetric encryption
  - Email addresses: ✅ Encrypted
  - Phone numbers: ✅ Encrypted
  - Message content: ✅ Encrypted
  - API keys/secrets: ✅ Encrypted in Render secrets manager

- **In Transit**: TLS 1.3 encryption
  - All API endpoints: HTTPS only
  - Certificate: [Render-managed, auto-renewed]
  - HSTS: 1-year enforcement

- **Backups**: Encrypted by default
  - PostgreSQL TDE (Transparent Data Encryption)
  - Daily automated backups
  - 30-day retention for disaster recovery

### 5.2 Access Control
- **Authentication**: JWT (JSON Web Tokens)
  - Access token expiry: 15 minutes
  - Refresh token expiry: 7 days
  - Token revocation on logout: ✅ Implemented (Redis blacklist)

- **Authorization**: Role-based access control (RBAC)
  - Roles: Admin, Staff, Volunteer, Viewer
  - Permissions enforced per endpoint
  - Multi-tenancy isolation: churchId-based

- **Multi-Factor Authentication**: Optional
  - Google Authenticator (TOTP)
  - Recovery codes for backup access
  - Recommended for admin accounts

### 5.3 Input Validation
- All user input validated with Zod schemas
- Prevents injection attacks (SQL, NoSQL, XSS, command injection)
- Schema enforcement: 100% of API endpoints

### 5.4 Rate Limiting
- Login attempts: 5 per 15 minutes
- Message sending: 100 per 15 minutes per church
- API requests: 100 per 15 minutes
- Prevents brute force and DoS attacks

### 5.5 Audit Logging
- All admin actions logged
- Login/logout events captured
- Data export/deletion events recorded
- 7-year retention for compliance

### 5.6 Network Security
- Firewall: Render's enterprise DDoS protection
- DDoS mitigation: Automatic on Render platform
- IP whitelisting available for webhooks
- No public database access (port 5432 closed)

### 5.7 Vulnerability Management
- Automated security scanning: Dependabot (daily)
- Vulnerability patches: Applied within 24 hours
- OWASP compliance: Top 10 2023 standards
- Penetration testing: Annual (recommended)

---

## 6. Processor Responsibilities

### 6.1 Shall Ensure
The Processor shall ensure:
- ✅ Only authorized staff access personal data
- ✅ Staff understand GDPR and security obligations
- ✅ Data protection measures remain effective
- ✅ Sub-processor compliance with this DPA
- ✅ Prompt notification of breaches (within 72 hours)
- ✅ Cooperation with data protection authorities
- ✅ Audit logs maintained for 7 years

### 6.2 Shall Not
The Processor shall not:
- ❌ Process data except as instructed by Controller
- ❌ Merge data from multiple customers
- ❌ Use data for Processor's own purposes
- ❌ Retain data beyond contracted period
- ❌ Disclose data except to authorized sub-processors
- ❌ Subcontract without approval

### 6.3 Shall Provide
The Processor shall provide:
- ✅ Security assessment reports upon request
- ✅ Breach notification procedures
- ✅ Data export in standard formats
- ✅ Audit trail documentation
- ✅ Sub-processor list (with DPAs)
- ✅ Compliance certifications (SOC 2, GDPR readiness)

---

## 7. Controller Responsibilities

### 7.1 Legal Basis
The Controller is responsible for:
- Determining the lawful basis for processing (consent, contract, legal obligation, legitimate interest)
- Obtaining necessary consents from data subjects
- Maintaining records of processing activities
- Conducting Data Protection Impact Assessments (DPIAs) if required

### 7.2 Instruction & Control
The Controller shall:
- Instruct Processor only to process as specified
- Ensure instructions comply with applicable law
- Approve any sub-processor changes
- Provide accurate data (no sensitive data beyond scope)

### 7.3 Data Subject Rights
The Controller shall:
- Handle data subject access requests
- Ensure data subjects can exercise rights
- Forward requests to Processor if needed
- Provide timely responses (within 30 days)

---

## 8. Data Breach Procedures

### 8.1 Breach Detection & Notification
1. **Discovery**: Processor detects breach or receives notification
2. **Assessment**: Processor determines if breach meets notification threshold
3. **Notification**: Processor notifies Controller **within 72 hours**
4. **Investigation**: Processor provides detailed breach report

### 8.2 Breach Report Contents
Processor shall provide:
- ✅ Nature of the breach
- ✅ Categories of data affected
- ✅ Approximate number of records
- ✅ Likely consequences for data subjects
- ✅ Measures taken to contain breach
- ✅ Recommended notification timeline
- ✅ Contact point for further information

### 8.3 Controller's Obligations
If breach occurs, Controller shall:
- Notify affected data subjects (unless low risk)
- Notify Data Protection Authority (if required)
- Document breach in processing records

---

## 9. Audits & Inspections

### 9.1 Controller's Right to Audit
The Controller may:
- Request security audit reports annually
- Conduct on-site inspections with 30 days notice
- Review audit logs and compliance documentation
- Interview Processor's security team
- Request remediation of deficiencies

### 9.2 Processor's Cooperation
The Processor shall:
- Provide access to audit logs and documentation
- Support security assessments and certifications
- Remediate issues within agreed timelines
- Provide SOC 2 audit reports (annual)

### 9.3 Third-Party Certifications
Processor maintains:
- ✅ SOC 2 Type II (annual)
- ✅ GDPR Article 32 compliance (documented)
- ✅ OWASP Top 10 compliance (annual)
- ✅ Dependabot security scanning (daily automated)

---

## 10. Data Protection Impact Assessment (DPIA)

### 10.1 When Required
The Controller shall conduct a DPIA if processing:
- Large-scale processing of sensitive data
- Automated decision-making affecting individuals
- Systematic monitoring of public areas
- Processing of special categories of data

### 10.2 Processor's Support
The Processor shall:
- Provide information about processing activities
- Describe security and privacy measures
- Explain potential risks and safeguards
- Support Controller in DPIA completion

---

## 11. Data Transfers (International)

### 11.1 EU to US Transfers
**Legal Mechanism**: Standard Contractual Clauses (SCCs)
- SCCs executed between Processor and Sub-processors
- Transfer Impact Assessment (TIA) completed
- Supplementary measures documented

**Supplementary Measures**:
- Encryption at rest (AES-256-GCM)
- Encryption in transit (TLS 1.3)
- Limited staff access (need-to-know basis)
- Audit logging (7-year retention)

### 11.2 Brexit (UK Adequacy)
- UK has GDPR equivalent laws
- Processor complies with UK DPA 2018
- No additional mechanisms required for UK data

### 11.3 US Adequacy (for CCPA/CPRA)
- Processor complies with CCPA consumer rights
- Data retention policies documented
- Sub-processor agreements confirmed

---

## 12. Term & Termination

### 12.1 Term
This DPA:
- Enters into effect when Services commence
- Continues for duration of Services
- Automatically renewsif Services renew
- May be updated with 30 days notice

### 12.2 Termination
Upon termination:
- Processor stops processing immediately
- Data deleted or returned within 30 days (Controller's choice)
- Audit logs may be retained for 7 years (legal requirement)
- Processor cooperates with transition

### 12.3 Survival
These clauses survive termination:
- Data breach notification
- Audit rights
- Liability limitations
- Conflict resolution

---

## 13. Liability & Indemnification

### 13.1 Processor's Liability
The Processor is liable for:
- ✅ Compliance with this DPA
- ✅ Processing only per Controller instructions
- ✅ Maintaining security measures
- ✅ Breach notification procedures
- ✅ Sub-processor compliance

### 13.2 Processor Limitations
The Processor is NOT liable for:
- ❌ Data provided incorrectly by Controller
- ❌ Controller's failure to use data security features
- ❌ External attacks/force majeure (unforeseeable events)
- ❌ Misuse of data by unauthorized users
- ❌ Deletion of data per Controller's request

### 13.3 Indemnification
Processor shall indemnify Controller for:
- Breaches of this DPA by Processor
- Unauthorized sub-processor use
- Misuse of data by Processor's staff
- Non-compliance with security standards

---

## 14. Amendments & Modifications

### 14.1 Changes to DPA
- Processor may update DPA with 30 days notice
- Changes apply only to new Customers unless material
- Existing Customers notified via email
- Customers may terminate if changes unacceptable

### 14.2 Changes to Law
If legal changes require DPA amendments:
- Processor updates terms to maintain compliance
- Controller notified promptly
- Costs of compliance borne by Processor

---

## 15. Conflict Resolution

### 15.1 Dispute Process
1. **Negotiation**: Parties discuss in good faith (30 days)
2. **Mediation**: If unresolved, engage neutral mediator (30 days)
3. **Escalation**: If mediation fails, formal review
4. **Legal Action**: Last resort, governed by applicable law

### 15.2 Governing Law
- **GDPR Disputes**: Laws of EU member state where Controller is based
- **CCPA Disputes**: Laws of California
- **LGPD Disputes**: Laws of Brazil
- **Other**: Laws of [Processor's jurisdiction]

---

## 16. Definitions

| Term | Definition |
|------|-----------|
| **Personal Data** | Any information relating to an identified/identifiable person |
| **Processing** | Any operation on data (collection, storage, use, deletion) |
| **Data Subject** | The individual to whom personal data relates |
| **Sub-Processor** | Third party authorized to process data on Processor's behalf |
| **Breach** | Unauthorized access/disclosure of personal data |
| **Encryption** | Converting data using cryptographic algorithms |
| **Data Protection Authority** | Government agency responsible for GDPR enforcement |

---

## 17. Appendices

### Appendix A: List of Sub-Processors
[Current as of December 3, 2025]

1. **Stripe**
   - Function: Payment processing
   - Location: United States
   - DPA: Yes, signed

2. **Telnyx**
   - Function: SMS/MMS delivery
   - Location: United States
   - DPA: Yes, signed

3. **Render**
   - Function: Cloud hosting
   - Location: United States (Virginia)
   - DPA: Yes, signed

4. **Sentry**
   - Function: Error logging
   - Location: United States
   - DPA: Yes, signed

### Appendix B: Data Processing Details

**Data Categories Processed**:
- Contact information (names, emails, phone numbers)
- Message content (SMS, MMS, attachments)
- Behavioral data (delivery status, engagement)
- Technical data (IP addresses, API usage)
- Audit logs (security events, admin actions)

**Processing Frequency**:
- Continuous (real-time message sending)
- On-demand (exports, API calls)
- Automated (backups, logs)

**Data Subject Categories**:
- Church administrators
- Church staff members
- Church volunteers
- Church members/contacts

### Appendix C: Security Measures Summary

| Measure | Implementation |
|---------|-----------------|
| Encryption at rest | AES-256-GCM |
| Encryption in transit | TLS 1.3 |
| Authentication | JWT + MFA optional |
| Access control | Role-based (RBAC) |
| Rate limiting | Per user/IP |
| Audit logging | 7-year retention |
| Backups | Daily, encrypted |
| Vulnerability scanning | Dependabot daily |
| DDoS protection | Render native |
| Staff training | Annual GDPR |

---

## 18. Signature

By using Koinonia YW Platform, you agree to this Data Processing Agreement.

**For the Processor (Koinonia YW Platform)**:
- Authorized Representative: [Name]
- Title: [Title]
- Date: December 3, 2025

**For the Controller (Customer)**:
- Name: ________________________
- Title: ________________________
- Date: ________________________

---

## 19. Contact & Support

**Questions about this DPA?**
📧 Email: privacy@koinoniasms.com
🌐 Web: [Your website]/dpa

**Data Protection Officer**:
📧 Email: dpo@koinoniasms.com
📞 Phone: [Phone number]

---

**Document Version**: 1.0
**Effective Date**: December 3, 2025
**Last Updated**: December 3, 2025
**Next Review**: December 3, 2026


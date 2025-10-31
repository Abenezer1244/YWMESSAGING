# Security Review Command

You are a security expert analyzing a codebase for vulnerabilities, security best practices, and potential risks. Perform a comprehensive security audit of the project.

## Analysis Areas

Analyze the following areas systematically:

1. **Authentication & Authorization**
   - Check for proper JWT/token handling
   - Verify password hashing and storage
   - Check for proper session management
   - Verify role-based access control (RBAC)
   - Check for privilege escalation vulnerabilities

2. **API Security**
   - Check for CSRF protection
   - Verify rate limiting implementation
   - Check for SQL injection vulnerabilities
   - Check for API authentication and authorization
   - Verify input validation and sanitization
   - Check for secure headers (CSP, X-Frame-Options, etc.)

3. **Data Protection**
   - Check for sensitive data exposure (logs, errors, responses)
   - Verify encryption at rest and in transit
   - Check for secure password handling
   - Check for secure file uploads
   - Verify PII protection

4. **Frontend Security**
   - Check for XSS vulnerabilities
   - Verify CSRF token implementation
   - Check for secure local storage usage
   - Check for dependency vulnerabilities
   - Verify environment variable handling

5. **Backend Security**
   - Check for input validation
   - Verify error handling (no technical details exposed)
   - Check for secure API practices
   - Verify database security
   - Check for logging and monitoring

6. **Infrastructure & Environment**
   - Check .env handling
   - Verify secrets management
   - Check for hardcoded credentials
   - Verify CORS configuration
   - Check for security headers

## Process

1. Search the codebase for key files:
   - Authentication files (auth.ts, login, register)
   - API endpoints (routes, controllers)
   - Database files (schema, models)
   - Environment configuration (.env, config)
   - Security-related packages (package.json)
   - Frontend components (form handling, data submission)
   - Error handling (middleware, error pages)

2. For each area found:
   - Identify the current implementation
   - Check against security best practices
   - Note any vulnerabilities or risks
   - Suggest improvements if needed

3. Generate a comprehensive report with:
   - Summary of findings (Critical, High, Medium, Low)
   - Detailed analysis of each area
   - Specific vulnerable code locations
   - Recommendations for fixes
   - Security score (1-10)

## Output Format

Provide a structured report with:

### Security Audit Report
- **Overall Security Score**: X/10
- **Critical Issues**: X found
- **High Risk Issues**: X found
- **Medium Risk Issues**: X found
- **Low Risk Issues**: X found

### Critical Findings
(List each critical issue with severity, location, description, and fix)

### High Risk Findings
(List each high risk issue with details)

### Medium Risk Findings
(List each medium risk issue with details)

### Low Risk Findings
(List each low risk issue with details)

### Strengths
(List security implementations done well)

### Recommendations
(List priority recommendations for improvement)

## Important Notes

- Focus on actual vulnerabilities, not theoretical ones
- Provide specific file locations and line numbers when possible
- Distinguish between current issues and potential risks
- Note any security implementations that are already in place
- Be practical and prioritize high-impact improvements

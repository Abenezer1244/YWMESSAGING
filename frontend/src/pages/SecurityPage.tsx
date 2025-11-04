import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import AnimatedBlobs from '../components/AnimatedBlobs';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background p-6 transition-colors duration-normal">
      <AnimatedBlobs />
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton variant="ghost" />
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Security</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-foreground/80">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Our Commitment to Security</h2>
            <p className="leading-relaxed">
              Koinonia takes the security of your data seriously. We are committed to implementing industry-leading security measures to protect your personal information, organization data, and communications. This page outlines our security practices and commitments.
            </p>
          </section>

          {/* Data Encryption */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Data Encryption</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground/90 mb-2">In Transit</h3>
                <p className="leading-relaxed">
                  All data transmitted between your device and our servers is encrypted using TLS 1.2 or higher. This ensures that your information cannot be intercepted or read by third parties.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground/90 mb-2">At Rest</h3>
                <p className="leading-relaxed">
                  All sensitive data stored on our servers is encrypted using AES-256 encryption. This protects your information even if our physical servers are compromised.
                </p>
              </div>
            </div>
          </section>

          {/* Authentication & Access */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Authentication & Access Control</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Multi-factor authentication (MFA) available for all accounts</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Role-based access control (RBAC) to limit user permissions</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Session management with automatic timeout</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Secure password requirements and recovery procedures</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>API key management with granular permissions</span>
              </li>
            </ul>
          </section>

          {/* Infrastructure Security */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Infrastructure Security</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground/90 mb-2">Hosting & Infrastructure</h3>
                <p className="leading-relaxed">
                  Koinonia is hosted on secure, enterprise-grade cloud infrastructure. Our servers are protected by firewalls, intrusion detection systems, and continuous monitoring.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground/90 mb-2">Data Centers</h3>
                <p className="leading-relaxed">
                  Our data centers are SOC 2 compliant and feature redundancy, backup power supplies, and climate control to ensure continuous availability and data protection.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground/90 mb-2">Regular Updates</h3>
                <p className="leading-relaxed">
                  We regularly update and patch all systems, applications, and dependencies to protect against known vulnerabilities.
                </p>
              </div>
            </div>
          </section>

          {/* Monitoring & Incident Response */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Monitoring & Incident Response</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>24/7 security monitoring and threat detection</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Comprehensive audit logs for all system activities</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Documented incident response procedures</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Regular security assessments and penetration testing</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Vulnerability disclosure program</span>
              </li>
            </ul>
          </section>

          {/* Compliance & Certifications */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Compliance & Certifications</h2>
            <p className="leading-relaxed mb-3">
              Koinonia complies with major data protection and security standards:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>SOC 2 Type II Certified</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>GDPR Compliant</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>CCPA Compliant</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>ISO 27001 Standards</span>
              </li>
            </ul>
          </section>

          {/* Employee Security */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Employee Security</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Background checks for all team members with access to data</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Regular security training and awareness programs</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Strict data access controls and least privilege principles</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Non-disclosure agreements and confidentiality obligations</span>
              </li>
            </ul>
          </section>

          {/* Reporting Security Issues */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Reporting Security Issues</h2>
            <p className="leading-relaxed mb-4">
              If you discover a security vulnerability, please report it to us immediately at security@connect.com. Please do not publicly disclose the vulnerability until we have had time to address it.
            </p>
            <div className="bg-muted border border-border rounded-lg p-6">
              <p className="text-foreground font-semibold mb-2">Security Contact</p>
              <p className="text-muted-foreground">Email: security@connect.com</p>
              <p className="text-muted-foreground">PGP Key: Available upon request</p>
            </div>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Us</h2>
            <p className="leading-relaxed mb-4">
              For security-related questions or concerns, please contact:
            </p>
            <div className="bg-muted border border-border rounded-lg p-6">
              <p className="text-foreground">Koinonia Support</p>
              <p className="text-muted-foreground">Email: support@connect.com</p>
              <p className="text-muted-foreground">Website: www.connect.com</p>
            </div>
          </section>
        </div>

        {/* Navigation Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link to="/" className="text-primary hover:text-primary/80 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

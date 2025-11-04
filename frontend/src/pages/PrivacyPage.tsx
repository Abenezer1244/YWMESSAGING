import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background p-6 transition-colors duration-normal">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton variant="ghost" />
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-foreground/80">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              Connect ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground/80 mb-2">Personal Information</h3>
                <p className="leading-relaxed">
                  We collect information that you voluntarily provide when you create an account, including your name, email address, phone number, and organization details.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground/80 mb-2">Usage Data</h3>
                <p className="leading-relaxed">
                  We automatically collect certain information about your interactions with our service, including IP address, browser type, pages visited, and time spent on pages.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground/80 mb-2">Message Content</h3>
                <p className="leading-relaxed">
                  We store message content, delivery status, and recipient information as necessary to provide and improve our SMS communication platform.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>To provide, maintain, and improve our services</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>To process transactions and send related information</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>To send promotional communications (with your consent)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>To detect and prevent fraudulent transactions</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>To comply with legal obligations</span>
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Your Privacy Rights</h2>
            <p className="leading-relaxed mb-3">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>The right to access your personal information</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>The right to correct inaccurate information</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>The right to request deletion of your information</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>The right to opt-out of marketing communications</span>
              </li>
            </ul>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Contact Us</h2>
            <p className="leading-relaxed mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-muted border border-border rounded-lg p-6">
              <p className="text-foreground">Connect Support</p>
              <p className="text-muted-foreground">Email: privacy@connect.com</p>
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

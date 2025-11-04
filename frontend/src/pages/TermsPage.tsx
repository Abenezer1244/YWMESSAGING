import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import AnimatedBlobs from '../components/AnimatedBlobs';

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-foreground/80">
          {/* Agreement to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
            <p className="leading-relaxed">
              By accessing and using the Koinonia platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          {/* Use License */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use License</h2>
            <p className="leading-relaxed mb-3">
              Permission is granted to temporarily download one copy of the materials (information or software) on Koinonia for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Modifying or copying the materials</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Using the materials for any commercial purpose or for any public display</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Attempting to decompile or reverse engineer any software contained on Koinonia</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Removing any copyright or other proprietary notations from the materials</span>
              </li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Disclaimer</h2>
            <p className="leading-relaxed">
              The materials on Koinonia are provided "as is". Koinonia makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          {/* Limitations of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Limitations of Liability</h2>
            <p className="leading-relaxed">
              In no event shall Koinonia or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Koinonia, even if Koinonia or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          {/* Accuracy of Materials */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Accuracy of Materials</h2>
            <p className="leading-relaxed">
              The materials appearing on Koinonia could include technical, typographical, or photographic errors. Koinonia does not warrant that any of the materials on its website are accurate, complete, or current. Koinonia may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. User Responsibilities</h2>
            <p className="leading-relaxed mb-3">
              By using Koinonia, you agree that you will not:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Send spam, harassing, or threatening messages</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Use the service for illegal purposes</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Violate any applicable laws or regulations</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Infringe upon any intellectual property rights</span>
              </li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Termination</h2>
            <p className="leading-relaxed">
              Koinonia may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms. Upon termination, your right to use the service will immediately cease.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Us</h2>
            <p className="leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us at:
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

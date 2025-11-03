import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 transition-colors duration-normal">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton variant="ghost" />
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Cookie Policy</h1>
          <p className="text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-300">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. What Are Cookies?</h2>
            <p className="leading-relaxed">
              Cookies are small files of letters and numbers that we store on your browser or the hard drive of your computer if you agree. Cookies contain information that is transferred to your computer's hard drive.
            </p>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Essential Cookies</h3>
                <p className="leading-relaxed">
                  These cookies are necessary for the website to function properly. They enable you to navigate the website and use its features. Without these cookies, services you have asked for cannot be properly provided.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Performance Cookies</h3>
                <p className="leading-relaxed">
                  These cookies collect information about how you use our website. This data helps us understand your preferences and improve the performance of our services.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Functional Cookies</h3>
                <p className="leading-relaxed">
                  These cookies enable us to provide personalized features and remember your preferences to enhance your experience on our website.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Marketing Cookies</h3>
                <p className="leading-relaxed">
                  These cookies are used to track your online activity to help us display advertisements that are more relevant to you and understand advertising effectiveness.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Cookies</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>To remember your login information and preferences</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>To understand how you use our website and services</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>To improve website functionality and user experience</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>To serve relevant advertisements and marketing materials</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>To prevent fraud and enhance security</span>
              </li>
            </ul>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Cookies</h2>
            <p className="leading-relaxed">
              We may use third-party services that set cookies on your device. These services include analytics providers, advertising networks, and social media platforms. We encourage you to review the cookie policies of these third parties.
            </p>
          </section>

          {/* Cookie Control */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. How to Control Cookies</h2>
            <p className="leading-relaxed mb-3">
              Most web browsers allow you to control cookies through their settings. You can typically:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>View what cookies you have on your device and delete them</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>Block cookies from specific websites</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>Block all cookies by default</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>Opt-out of behavioral advertising</span>
              </li>
            </ul>
            <p className="leading-relaxed mt-4">
              Please note that disabling cookies may affect the functionality of our website.
            </p>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Protection</h2>
            <p className="leading-relaxed">
              Any information collected via cookies is subject to our Privacy Policy. We take reasonable steps to ensure that the data collected is secure and protected against unauthorized access.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
            <p className="leading-relaxed mb-4">
              If you have questions about our use of cookies, please contact us at:
            </p>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <p className="text-white">Connect Support</p>
              <p className="text-slate-400">Email: privacy@connect.com</p>
              <p className="text-slate-400">Website: www.connect.com</p>
            </div>
          </section>
        </div>

        {/* Navigation Links */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <Link to="/" className="text-accent-400 hover:text-accent-300 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-secondary-900 dark:bg-secondary-950 text-secondary-400 dark:text-secondary-400 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 dark:from-primary-500 to-primary-800 dark:to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">YW</span>
              </div>
              <span className="text-xl font-bold text-white dark:text-secondary-50">Connect YW</span>
            </Link>
            <p className="text-sm text-secondary-400 dark:text-secondary-500 mb-4">
              Enterprise SMS communication platform for churches managing multiple locations and hundreds of members.
            </p>
            <div className="flex space-x-4">
              {/* Social media icons placeholder */}
              <a href="#" className="text-secondary-400 dark:text-secondary-500 hover:text-secondary-200 dark:hover:text-secondary-300 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-secondary-400 dark:text-secondary-500 hover:text-secondary-200 dark:hover:text-secondary-300 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-secondary-400 dark:text-secondary-500 hover:text-secondary-200 dark:hover:text-secondary-300 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-white dark:text-secondary-50 font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="text-secondary-400 dark:text-secondary-400 hover:text-secondary-200 dark:hover:text-secondary-200 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-secondary-400 dark:text-secondary-400 hover:text-secondary-200 dark:hover:text-secondary-200 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-secondary-400 dark:text-secondary-400 hover:text-secondary-200 dark:hover:text-secondary-200 transition-colors">
                  Testimonials
                </a>
              </li>
              <li>
                <Link to="/register" className="text-secondary-400 dark:text-secondary-400 hover:text-secondary-200 dark:hover:text-secondary-200 transition-colors">
                  Start Free Trial
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white dark:text-secondary-50 font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-secondary-400 dark:text-secondary-400 hover:text-secondary-200 dark:hover:text-secondary-200 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="mailto:support@connect-yw.com" className="text-secondary-400 dark:text-secondary-400 hover:text-secondary-200 dark:hover:text-secondary-200 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-400 dark:text-secondary-400 hover:text-secondary-200 dark:hover:text-secondary-200 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-400 dark:text-secondary-400 hover:text-secondary-200 dark:hover:text-secondary-200 transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-white dark:text-secondary-50 font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-secondary-400 dark:text-secondary-400 hover:text-secondary-200 dark:hover:text-secondary-200 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-400 dark:text-secondary-400 hover:text-secondary-200 dark:hover:text-secondary-200 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-400 dark:text-secondary-400 hover:text-secondary-200 dark:hover:text-secondary-200 transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-400 dark:text-secondary-400 hover:text-secondary-200 dark:hover:text-secondary-200 transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-800 dark:border-secondary-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-secondary-500 dark:text-secondary-500">
            &copy; {new Date().getFullYear()} Connect YW. All rights reserved.
          </p>
          <p className="text-sm text-secondary-500 dark:text-secondary-500 mt-4 md:mt-0">
            Made with <span className="text-red-500 dark:text-red-400">♥</span> for churches
          </p>
        </div>
      </div>
    </footer>
  );
}


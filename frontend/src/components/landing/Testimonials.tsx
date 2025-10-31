import Card from '../ui/Card';

interface Testimonial {
  name: string;
  role: string;
  church: string;
  content: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Pastor Michael Thompson',
    role: 'Senior Pastor',
    church: 'Grace Community Church',
    content: 'Connect YW has transformed how we communicate with our congregation. Managing messages across our 5 locations is now seamless, and our members love the personal touch.',
  },
  {
    name: 'Sarah Johnson',
    role: 'Church Administrator',
    church: 'First Baptist Church',
    content: 'The analytics dashboard gives us incredible insights into engagement. We\'ve seen a 40% increase in member participation since using scheduled messages and templates.',
  },
  {
    name: 'Rev. David Martinez',
    role: 'Lead Pastor',
    church: 'Hope Chapel Ministries',
    content: 'The recurring message feature is a game-changer. Birthday messages, weekly reminders, and welcome messages all happen automatically. It\'s like having an extra staff member!',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-secondary-900 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-4xl sm:text-5xl font-bold text-secondary-900 dark:text-secondary-50 mb-4">
            Trusted by <span className="text-primary-600 dark:text-primary-400">Church Leaders</span>
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
            See how churches across the country are using Connect YW to strengthen their communities.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              variant="default"
              className="animate-slideUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <svg
                  className="w-12 h-12 text-primary-200 dark:text-primary-800"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Content */}
              <p className="text-secondary-700 dark:text-secondary-300 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 dark:from-primary-500 to-primary-600 dark:to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-secondary-900 dark:text-secondary-50">{testimonial.name}</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">
                    {testimonial.role}, {testimonial.church}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-12 border-t border-secondary-200 dark:border-secondary-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">100+</div>
              <div className="text-secondary-600 dark:text-secondary-400">Churches</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">25K+</div>
              <div className="text-secondary-600 dark:text-secondary-400">Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">500K+</div>
              <div className="text-secondary-600 dark:text-secondary-400">Messages Sent</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">99.9%</div>
              <div className="text-secondary-600 dark:text-secondary-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


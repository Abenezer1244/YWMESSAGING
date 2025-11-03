export default function DashboardPreview() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-10 w-96 h-96 bg-accent-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent-400 opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Powerful Dashboard
            <br />
            <span className="bg-gradient-to-r from-accent-300 via-accent-500 to-primary-400 bg-clip-text text-transparent">
              Real-Time Insights
            </span>
          </h2>
          <p className="text-xl text-primary-100/90 max-w-2xl mx-auto">
            Monitor your church communication with comprehensive analytics, detailed activity logs, and actionable metrics.
          </p>
        </div>

        {/* Dashboard Preview Card */}
        <div className="relative group">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-pacific via-blue-sky-blue to-blue-honolulu rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-500 animate-pulse"></div>

          {/* Modern Card */}
          <div className="relative bg-gradient-to-br from-blue-700/40 to-blue-marian/40 rounded-2xl p-8 lg:p-12 border border-blue-600/40 backdrop-blur-xl shadow-2xl overflow-hidden animate-slideUp group-hover:shadow-blue-900/50 transition-shadow duration-500">
            {/* Accent gradient top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-pacific to-transparent"></div>

            {/* Card Header */}
            <div className="mb-8 pb-6 border-b border-blue-600/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-pacific"></div>
                <div className="text-sm font-semibold text-blue-100">Dashboard Preview</div>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white">Message Analytics</h3>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-blue-600/30 rounded-lg border border-blue-500/20">
                <div className="text-xs text-blue-300 mb-2">DELIVERED</div>
                <div className="text-2xl lg:text-3xl font-bold text-blue-pacific">2,847</div>
              </div>
              <div className="p-4 bg-blue-600/30 rounded-lg border border-blue-500/20">
                <div className="text-xs text-blue-300 mb-2">ENGAGED</div>
                <div className="text-2xl lg:text-3xl font-bold text-success-500">89%</div>
              </div>
            </div>

            {/* Activity Chart Mockup */}
            <div className="space-y-3 mb-8">
              <div className="text-sm font-semibold text-blue-100">Recent Activity</div>
              {[80, 65, 90, 45, 75].map((height, i) => (
                <div key={i} className="flex items-end gap-2 h-8">
                  <div className="flex-1 bg-gradient-to-t from-blue-pacific to-blue-sky-blue rounded-t opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${height}%` }}></div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 py-3 px-4 bg-blue-pacific hover:bg-blue-sky-blue text-blue-900 font-semibold rounded-lg transition-colors duration-300">
                Export
              </button>
              <button className="px-4 py-3 bg-blue-600/40 hover:bg-blue-600/60 text-blue-100 rounded-lg transition-colors duration-300">
                ⋯
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid Below Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            {
              title: 'Real-Time Analytics',
              description: 'Track delivery rates, engagement metrics, and member activity as it happens.'
            },
            {
              title: 'Detailed Reporting',
              description: 'Export comprehensive reports for board meetings and strategic planning.'
            },
            {
              title: 'Smart Insights',
              description: 'Get AI-powered recommendations to improve your communication strategy.'
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-accent-500/50 transition-colors duration-300 text-center"
            >
              <h4 className="text-lg font-semibold text-white mb-3">{feature.title}</h4>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

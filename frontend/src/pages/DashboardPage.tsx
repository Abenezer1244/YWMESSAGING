import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useBranchStore from '../stores/branchStore';
import BranchSelector from '../components/BranchSelector';
import TrialBanner from '../components/TrialBanner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, church, logout } = useAuthStore();
  const { currentBranchId } = useBranchStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const daysUntilTrialEnd = church ? Math.ceil(
    (new Date(church.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  ) : 0;

  const trialStatus = daysUntilTrialEnd > 0 ? 'active' : 'expired';
  const trialColor = daysUntilTrialEnd >= 8 ? 'success' : daysUntilTrialEnd >= 4 ? 'warning' : 'danger';

  const navigationItems = [
    { label: '📍 Branches', action: () => navigate('/branches'), always: true },
    { label: '👥 Groups', action: () => navigate(`/branches/${currentBranchId}/groups`), conditional: true },
    { label: '👤 Members', action: () => navigate(`/members?groupId=`), conditional: true },
    { label: '📨 Send Message', action: () => navigate('/send-message'), conditional: true },
    { label: '📜 History', action: () => navigate('/message-history'), conditional: true },
    { label: '📋 Templates', action: () => navigate('/templates'), conditional: true },
    { label: '🔄 Recurring', action: () => navigate('/recurring-messages'), conditional: true },
    { label: '📊 Analytics', action: () => navigate('/analytics'), conditional: true },
    { label: '💳 Billing', action: () => navigate('/billing'), always: true },
    { label: '⚙️ Settings', action: () => navigate('/admin/settings'), always: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50 dark:from-primary-950 dark:to-primary-900 transition-colors duration-normal">
      {/* Header */}
      <header className="bg-white dark:bg-primary-900 shadow-sm border-b border-neutral-200 dark:border-primary-800 transition-colors duration-normal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-primary-900 font-bold text-base">C</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
                <p className="text-neutral-600 dark:text-neutral-400">{church?.name}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-2 items-center">
            {navigationItems.map((item) => {
              const shouldShow = item.always || (item.conditional && currentBranchId);
              if (!shouldShow) return null;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="px-4 py-2 text-neutral-700 dark:text-neutral-300 font-medium text-sm hover:bg-accent-50 dark:hover:bg-primary-800 rounded-lg transition-colors duration-normal border border-neutral-200 dark:border-primary-700 hover:border-accent-300 dark:hover:border-accent-500"
                >
                  {item.label}
                </button>
              );
            })}
            <BranchSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trial Banner */}
        <TrialBanner />

        {/* Welcome Section */}
        <div className="mb-8 animate-fadeIn">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">
            Welcome back, {user?.firstName}! 👋
          </h2>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info Card */}
            <Card variant="default" className="border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950 rounded-lg flex items-center justify-center text-2xl">
                  👤
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">Your Account</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-neutral-600 dark:text-neutral-400">
                      <span className="font-medium text-neutral-900 dark:text-white">{user?.firstName} {user?.lastName}</span>
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      <span className="text-neutral-500 dark:text-neutral-400">{user?.email}</span>
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs font-semibold">{user?.role}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Church Info Card */}
            <Card variant="default" className="border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950 rounded-lg flex items-center justify-center text-2xl">
                  ⛪
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">Church Details</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-neutral-600 dark:text-neutral-400">
                      <span className="font-medium text-neutral-900 dark:text-white">{church?.name}</span>
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      <span className="text-neutral-500 dark:text-neutral-400">{church?.email}</span>
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Trial ends <span className="font-semibold text-neutral-900 dark:text-white">{new Date(church?.trialEndsAt || '').toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="default" className="text-center border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950 rounded-lg flex items-center justify-center mx-auto mb-4 text-3xl">
              📍
            </div>
            <div className="text-4xl font-bold text-primary-500 dark:text-primary-400 mb-2">0</div>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-4">Active Branches</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/branches')}
              fullWidth
            >
              View Branches
            </Button>
          </Card>

          <Card variant="default" className="text-center border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950 rounded-lg flex items-center justify-center mx-auto mb-4 text-3xl">
              👥
            </div>
            <div className="text-4xl font-bold text-primary-500 dark:text-primary-400 mb-2">0</div>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-4">Total Members</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/members?groupId=`)}
              fullWidth
            >
              Manage Members
            </Button>
          </Card>

          <Card variant="default" className="text-center border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950 rounded-lg flex items-center justify-center mx-auto mb-4 text-3xl">
              📨
            </div>
            <div className="text-4xl font-bold text-primary-500 dark:text-primary-400 mb-2">0</div>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-4">Messages Sent</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/send-message')}
              fullWidth
            >
              Send Message
            </Button>
          </Card>
        </div>

        {/* Quick Features */}
        <Card variant="default" className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">✨ Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '📍', title: 'Multi-Branch', desc: 'Manage multiple church locations' },
              { icon: '👥', title: 'Groups & Members', desc: 'Organize and segment your congregation' },
              { icon: '📨', title: 'SMS Messaging', desc: 'Send direct messages to members' },
              { icon: '📋', title: 'Templates', desc: 'Reuse pre-built message templates' },
              { icon: '🔄', title: 'Recurring Messages', desc: 'Automate regular communications' },
              { icon: '📊', title: 'Analytics', desc: 'Track engagement and delivery rates' },
            ].map((feature, idx) => (
              <div key={idx} className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">{feature.title}</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

export default DashboardPage;

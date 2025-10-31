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
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950 transition-colors duration-normal">
      {/* Header */}
      <header className="bg-white dark:bg-secondary-800 shadow-md border-b border-secondary-200 dark:border-secondary-700 transition-colors duration-normal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 dark:from-primary-500 to-primary-700 dark:to-primary-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">YW</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-50">Dashboard</h1>
                <p className="text-secondary-600 dark:text-secondary-400">{church?.name}</p>
              </div>
            </div>
            <Button
              variant="danger"
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
                  className="px-4 py-2 text-secondary-700 dark:text-secondary-300 font-medium hover:bg-primary-100 dark:hover:bg-primary-900 rounded-lg transition-colors duration-normal border border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-600"
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
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-6">
            Welcome back, {user?.firstName}! 👋
          </h2>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info Card */}
            <Card variant="default">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-3">Your Account</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-secondary-600 dark:text-secondary-400">
                      <span className="font-medium text-secondary-900 dark:text-secondary-50">{user?.firstName} {user?.lastName}</span>
                    </p>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      <span className="text-secondary-500 dark:text-secondary-400">{user?.email}</span>
                    </p>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs font-semibold">{user?.role}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Church Info Card */}
            <Card variant="default">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-info-100 dark:bg-info-900 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⛪</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-3">Church Details</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-secondary-600 dark:text-secondary-400">
                      <span className="font-medium text-secondary-900 dark:text-secondary-50">{church?.name}</span>
                    </p>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      <span className="text-secondary-500 dark:text-secondary-400">{church?.email}</span>
                    </p>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      Trial ends <span className="font-semibold text-secondary-900 dark:text-secondary-50">{new Date(church?.trialEndsAt || '').toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="default" className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📍</span>
            </div>
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">0</div>
            <p className="text-secondary-600 dark:text-secondary-400 font-medium">Active Branches</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/branches')}
              className="mt-4"
              fullWidth
            >
              View Branches
            </Button>
          </Card>

          <Card variant="default" className="text-center">
            <div className="w-16 h-16 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👥</span>
            </div>
            <div className="text-4xl font-bold text-success-600 dark:text-success-400 mb-2">0</div>
            <p className="text-secondary-600 dark:text-secondary-400 font-medium">Total Members</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/members?groupId=`)}
              className="mt-4"
              fullWidth
            >
              Manage Members
            </Button>
          </Card>

          <Card variant="default" className="text-center">
            <div className="w-16 h-16 bg-info-100 dark:bg-info-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📨</span>
            </div>
            <div className="text-4xl font-bold text-info-600 dark:text-info-400 mb-2">0</div>
            <p className="text-secondary-600 dark:text-secondary-400 font-medium">Messages Sent</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/send-message')}
              className="mt-4"
              fullWidth
            >
              Send Message
            </Button>
          </Card>
        </div>

        {/* Quick Features */}
        <Card variant="highlight">
          <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-50 mb-4">✨ Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '📍', title: 'Multi-Branch', desc: 'Manage multiple church locations' },
              { icon: '👥', title: 'Groups & Members', desc: 'Organize and segment your congregation' },
              { icon: '📨', title: 'SMS Messaging', desc: 'Send direct messages to members' },
              { icon: '📋', title: 'Templates', desc: 'Reuse pre-built message templates' },
              { icon: '🔄', title: 'Recurring Messages', desc: 'Automate regular communications' },
              { icon: '📊', title: 'Analytics', desc: 'Track engagement and delivery rates' },
            ].map((feature, idx) => (
              <div key={idx} className="p-4 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h4 className="font-semibold text-secondary-900 dark:text-secondary-50">{feature.title}</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

export default DashboardPage;

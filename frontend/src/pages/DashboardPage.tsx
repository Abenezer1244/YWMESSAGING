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
    { label: 'Branches', action: () => navigate('/branches'), always: true },
    { label: 'Groups', action: () => navigate(`/branches/${currentBranchId}/groups`), conditional: true },
    { label: 'Members', action: () => navigate(`/members?groupId=`), conditional: true },
    { label: 'Send Message', action: () => navigate('/send-message'), conditional: true },
    { label: 'History', action: () => navigate('/message-history'), conditional: true },
    { label: 'Templates', action: () => navigate('/templates'), conditional: true },
    { label: 'Recurring', action: () => navigate('/recurring-messages'), conditional: true },
    { label: 'Analytics', action: () => navigate('/analytics'), conditional: true },
    { label: 'Billing', action: () => navigate('/billing'), always: true },
    { label: 'Settings', action: () => navigate('/admin/settings'), always: true },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-normal">
      {/* Header */}
      <header className="bg-muted shadow-sm border-b border-border transition-colors duration-normal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-background font-bold text-base">C</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">{church?.name}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={handleLogout}
              className="border-border text-foreground hover:bg-muted"
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
                  className="px-4 py-2 text-foreground font-medium text-sm hover:bg-muted/50 rounded-lg transition-colors duration-normal border border-border hover:border-primary"
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
          <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
            Welcome back, {user?.firstName}!
          </h2>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info Card */}
            <Card variant="default" className="border border-border bg-card hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Your Account</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-foreground/80">
                      <span className="font-medium text-foreground">{user?.firstName} {user?.lastName}</span>
                    </p>
                    <p className="text-foreground/80">
                      <span className="text-muted-foreground">{user?.email}</span>
                    </p>
                    <p className="text-foreground/80">
                      <span className="inline-block px-2 py-1 bg-primary/20 text-primary rounded text-xs font-semibold">{user?.role}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Church Info Card */}
            <Card variant="default" className="border border-border bg-card hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Church Details</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-foreground/80">
                      <span className="font-medium text-foreground">{church?.name}</span>
                    </p>
                    <p className="text-foreground/80">
                      <span className="text-muted-foreground">{church?.email}</span>
                    </p>
                    <p className="text-foreground/80">
                      Trial ends <span className="font-semibold text-foreground">{new Date(church?.trialEndsAt || '').toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="default" className="text-center border border-border bg-card hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="w-7 h-7 bg-blue-500 rounded-full"></div>
            </div>
            <div className="text-4xl font-bold text-primary mb-2">0</div>
            <p className="text-muted-foreground font-medium mb-4">Active Branches</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/branches')}
              fullWidth
              className="border-border text-foreground hover:bg-muted"
            >
              View Branches
            </Button>
          </Card>

          <Card variant="default" className="text-center border border-border bg-card hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="w-7 h-7 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-4xl font-bold text-primary mb-2">0</div>
            <p className="text-muted-foreground font-medium mb-4">Total Members</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/members?groupId=`)}
              fullWidth
              className="border-border text-foreground hover:bg-muted"
            >
              Manage Members
            </Button>
          </Card>

          <Card variant="default" className="text-center border border-border bg-card hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="w-7 h-7 bg-orange-500 rounded-full"></div>
            </div>
            <div className="text-4xl font-bold text-primary mb-2">0</div>
            <p className="text-muted-foreground font-medium mb-4">Messages Sent</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/send-message')}
              fullWidth
              className="border-border text-foreground hover:bg-muted"
            >
              Send Message
            </Button>
          </Card>
        </div>

        {/* Quick Features */}
        <Card variant="default" className="border border-border bg-card">
          <h3 className="text-xl font-bold text-foreground mb-6">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { color: 'blue', title: 'Multi-Branch', desc: 'Manage multiple church locations' },
              { color: 'green', title: 'Groups & Members', desc: 'Organize and segment your congregation' },
              { color: 'orange', title: 'SMS Messaging', desc: 'Send direct messages to members' },
              { color: 'purple', title: 'Templates', desc: 'Reuse pre-built message templates' },
              { color: 'pink', title: 'Recurring Messages', desc: 'Automate regular communications' },
              { color: 'cyan', title: 'Analytics', desc: 'Track engagement and delivery rates' },
            ].map((feature, idx) => {
              const colorMap: any = {
                blue: 'bg-blue-500/10 border-blue-500/20',
                green: 'bg-green-500/10 border-green-500/20',
                orange: 'bg-orange-500/10 border-orange-500/20',
                purple: 'bg-purple-500/10 border-purple-500/20',
                pink: 'bg-pink-500/10 border-pink-500/20',
                cyan: 'bg-cyan-500/10 border-cyan-500/20',
              };
              const dotColorMap: any = {
                blue: 'bg-blue-500',
                green: 'bg-green-500',
                orange: 'bg-orange-500',
                purple: 'bg-purple-500',
                pink: 'bg-pink-500',
                cyan: 'bg-cyan-500',
              };
              return (
                <div key={idx} className={`p-4 ${colorMap[feature.color]} border rounded-lg hover:shadow-md transition-all`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-3 h-3 ${dotColorMap[feature.color]} rounded-full flex-shrink-0 mt-1`}></div>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
}

export default DashboardPage;

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Users,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../stores/authStore';
import useBranchStore from '../stores/branchStore';
import BranchSelector from '../components/BranchSelector';
import TrialBanner from '../components/TrialBanner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { StatCard } from '../components/dashboard/StatCard';
import { FeaturedCard } from '../components/dashboard/FeaturedCard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { useState } from 'react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, church, logout } = useAuthStore();
  const { currentBranchId } = useBranchStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock data for charts
  const barChartData = [
    { name: 'Mon', active: 240 },
    { name: 'Tue', active: 320 },
    { name: 'Wed', active: 180 },
    { name: 'Thu', active: 400 },
    { name: 'Fri', active: 290 },
    { name: 'Sat', active: 150 },
    { name: 'Sun', active: 200 },
  ];

  const lineChartData = [
    { name: 'Week 1', sent: 100, delivered: 90 },
    { name: 'Week 2', sent: 150, delivered: 140 },
    { name: 'Week 3', sent: 200, delivered: 180 },
    { name: 'Week 4', sent: 250, delivered: 230 },
  ];

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
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Koinonia</h1>
                <p className="text-xs text-muted-foreground">{church?.name}</p>
              </div>
            </motion.div>

            {/* Search + Actions */}
            <div className="flex items-center gap-4">
              <BranchSelector />
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/admin/settings')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleLogout}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trial Banner */}
        <div className="mb-12">
          <TrialBanner />
        </div>

        {/* Welcome Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{user?.firstName}</span>
          </h2>
          <p className="text-lg text-muted-foreground">Here's what's happening with your church today</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={MessageSquare}
            label="Messages Sent"
            value="1,234"
            change={55}
            changeType="positive"
            bgColor="bg-blue-500"
            iconColor="text-blue-500"
            index={0}
          />
          <StatCard
            icon={Users}
            label="Total Members"
            value="2,890"
            change={12}
            changeType="positive"
            bgColor="bg-green-500"
            iconColor="text-green-500"
            index={1}
          />
          <StatCard
            icon={TrendingUp}
            label="Delivery Rate"
            value="94.2%"
            change={-2}
            changeType="negative"
            bgColor="bg-purple-500"
            iconColor="text-purple-500"
            index={2}
          />
          <StatCard
            icon={Zap}
            label="Active Groups"
            value="45"
            change={8}
            changeType="positive"
            bgColor="bg-orange-500"
            iconColor="text-orange-500"
            index={3}
          />
        </div>

        {/* Featured Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <FeaturedCard
            title="Quick Actions"
            description="Access your most-used features in one place. Send messages, manage members, or view analytics instantly."
            gradient="bg-gradient-to-br from-blue-400 to-blue-600"
            actionLabel="Get Started"
            onAction={() => navigate('/send-message')}
            index={0}
          />

          <FeaturedCard
            title="Organization Tips"
            description="Learn best practices for managing your congregation. Improve engagement and communication with smart segmentation."
            gradient="bg-gradient-to-br from-slate-800 to-slate-900"
            actionLabel="Learn More"
            isDark
            index={1}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ChartCard
            title="Active Users"
            subtitle="(+23%) than last week"
            index={0}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.1)" />
                <XAxis dataKey="name" stroke="rgba(120,120,120,0.5)" />
                <YAxis stroke="rgba(120,120,120,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20,20,30,0.8)',
                    border: '1px solid rgba(120,120,120,0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="active"
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Message Analytics"
            subtitle="Sent vs Delivered"
            index={1}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.1)" />
                <XAxis dataKey="name" stroke="rgba(120,120,120,0.5)" />
                <YAxis stroke="rgba(120,120,120,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20,20,30,0.8)',
                    border: '1px solid rgba(120,120,120,0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card variant="default" className="border border-border bg-card">
            <h3 className="text-xl font-bold text-foreground mb-6">Quick Navigation</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {navigationItems.map((item) => {
                const shouldShow = item.always || (item.conditional && currentBranchId);
                if (!shouldShow) return null;
                return (
                  <motion.button
                    key={item.label}
                    whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                    onClick={item.action}
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-border transition-all text-center group"
                  >
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.label}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default DashboardPage;

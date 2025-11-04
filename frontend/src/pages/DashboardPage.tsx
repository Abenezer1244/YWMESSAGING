import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Users,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Loader,
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/authStore';
import useBranchStore from '../stores/branchStore';
import { getMessageStats, getSummaryStats } from '../api/analytics';
import { getMembers } from '../api/members';
import { getGroups } from '../api/groups';
import { Sidebar } from '../components/Sidebar';
import TrialBanner from '../components/TrialBanner';
import Card from '../components/ui/Card';
import { StatCard } from '../components/dashboard/StatCard';
import { FeaturedCard } from '../components/dashboard/FeaturedCard';
import { ChartCard } from '../components/dashboard/ChartCard';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, church } = useAuthStore();
  const { branches, currentBranchId } = useBranchStore();

  const [loading, setLoading] = useState(true);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  const [messageStats, setMessageStats] = useState<any>(null);
  const [summaryStats, setSummaryStats] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, [currentBranchId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load members count
      if (currentBranchId) {
        const groupsData = await getGroups(currentBranchId);
        setTotalGroups(groupsData.length);

        // Try to load members from first group
        if (groupsData.length > 0) {
          const membersData = await getMembers(groupsData[0].id, { limit: 1 });
          setTotalMembers(membersData.pagination.total);
        }
      }

      // Load analytics
      const stats = await getSummaryStats();
      setSummaryStats(stats);

      const msgStats = await getMessageStats({ days: 7 });
      setMessageStats(msgStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const totalBranches = branches.length;
  const totalMessagesSent = summaryStats?.totalMessages || 0;
  const deliveryRate = messageStats?.deliveryRate || 0;
  const totalGroupsActive = summaryStats?.totalGroups || 0;

  // Transform message stats for chart
  const barChartData = messageStats?.byDay
    ? messageStats.byDay.map((day: any) => ({
        name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        delivered: day.delivered,
        failed: day.failed,
      }))
    : [];

  const lineChartData = messageStats?.byDay
    ? messageStats.byDay.map((day: any, idx: number) => ({
        name: `Day ${idx + 1}`,
        sent: day.count,
        delivered: day.delivered,
      }))
    : [];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-0 ml-0 pt-16 md:pt-0 px-4 md:px-8 py-8">
        {/* Trial Banner */}
        <div className="mb-8">
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

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <Loader className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard
                icon={MessageSquare}
                label="Messages Sent"
                value={totalMessagesSent.toLocaleString()}
                change={12}
                changeType="positive"
                bgColor="bg-blue-500"
                iconColor="text-blue-500"
                index={0}
              />
              <StatCard
                icon={Users}
                label="Total Members"
                value={totalMembers.toLocaleString()}
                change={8}
                changeType="positive"
                bgColor="bg-green-500"
                iconColor="text-green-500"
                index={1}
              />
              <StatCard
                icon={TrendingUp}
                label="Delivery Rate"
                value={`${deliveryRate.toFixed(1)}%`}
                change={-2}
                changeType="negative"
                bgColor="bg-purple-500"
                iconColor="text-purple-500"
                index={2}
              />
              <StatCard
                icon={Zap}
                label="Active Groups"
                value={totalGroupsActive.toString()}
                change={5}
                changeType="positive"
                bgColor="bg-orange-500"
                iconColor="text-orange-500"
                index={3}
              />
            </div>

            {/* Featured Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <FeaturedCard
                title="Send Messages"
                description="Reach your congregation instantly with personalized SMS messages. Segment by groups or broadcast to everyone."
                gradient="bg-gradient-to-br from-blue-400 to-blue-600"
                actionLabel="Send Now"
                onAction={() => navigate('/send-message')}
                index={0}
              />

              <FeaturedCard
                title="Manage Members"
                description="Keep your member database organized. Add, update, or import members in bulk with our easy-to-use interface."
                gradient="bg-gradient-to-br from-slate-800 to-slate-900"
                actionLabel="View Members"
                isDark
                index={1}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <ChartCard
                title="Delivery Rate"
                subtitle="Last 7 days"
                index={0}
              >
                {barChartData.length > 0 ? (
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
                        dataKey="delivered"
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
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    No data available yet
                  </div>
                )}
              </ChartCard>

              <ChartCard
                title="Message Trend"
                subtitle="Sent vs Delivered"
                index={1}
              >
                {lineChartData.length > 0 ? (
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
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    No data available yet
                  </div>
                )}
              </ChartCard>
            </div>

            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card variant="default" className="border border-border bg-card">
                <h3 className="text-xl font-bold text-foreground mb-6">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Branches</p>
                    <p className="text-2xl font-bold text-foreground">{totalBranches}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Groups</p>
                    <p className="text-2xl font-bold text-foreground">{totalGroupsActive}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Members</p>
                    <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Messages</p>
                    <p className="text-2xl font-bold text-foreground">{totalMessagesSent}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;

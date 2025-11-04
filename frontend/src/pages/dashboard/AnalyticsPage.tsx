import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import BackButton from '../../components/BackButton';
import {
  getMessageStats,
  getBranchStats,
  getSummaryStats,
  MessageStats,
  BranchStats,
  SummaryStats,
} from '../../api/analytics';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui';

export function AnalyticsPage() {
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null);
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const [msgStats, branchData, summaryData] = await Promise.all([
        getMessageStats({ days }),
        getBranchStats(),
        getSummaryStats(),
      ]);

      setMessageStats(msgStats);
      setBranchStats(branchData);
      setSummaryStats(summaryData);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton variant="ghost" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">📊 Analytics</h1>
            <p className="text-foreground/80">Track your messaging performance and engagement</p>
          </div>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-normal"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" text="Loading analytics..." />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            {summaryStats && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card variant="default" className="text-center bg-muted border-border">
                  <p className="text-muted-foreground text-sm mb-2">📨 Total Messages</p>
                  <p className="text-3xl font-bold text-accent-400">
                    {summaryStats.totalMessages}
                  </p>
                </Card>

                <Card variant="default" className="text-center bg-slate-900/50 border-slate-700">
                  <p className="text-muted-foreground text-sm mb-2">✅ Delivery Rate</p>
                  <p className="text-3xl font-bold text-green-400">
                    {summaryStats.averageDeliveryRate}%
                  </p>
                </Card>

                <Card variant="default" className="text-center bg-slate-900/50 border-slate-700">
                  <p className="text-muted-foreground text-sm mb-2">👤 Total Members</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {summaryStats.totalMembers}
                  </p>
                </Card>

                <Card variant="default" className="text-center bg-slate-900/50 border-slate-700">
                  <p className="text-muted-foreground text-sm mb-2">📍 Branches</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {summaryStats.totalBranches}
                  </p>
                </Card>

                <Card variant="default" className="text-center bg-slate-900/50 border-slate-700">
                  <p className="text-muted-foreground text-sm mb-2">👥 Total Groups</p>
                  <p className="text-3xl font-bold text-red-400">
                    {summaryStats.totalGroups}
                  </p>
                </Card>
              </div>
            )}

            {/* Message Volume Chart */}
            {messageStats && messageStats.byDay.length > 0 && (
              <Card variant="default" className="bg-muted border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  📈 Message Volume
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={messageStats.byDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      name="Messages Sent"
                    />
                    <Line
                      type="monotone"
                      dataKey="delivered"
                      stroke="#10b981"
                      name="Delivered"
                    />
                    <Line
                      type="monotone"
                      dataKey="failed"
                      stroke="#ef4444"
                      name="Failed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Branch Comparison */}
            {branchStats.length > 0 && (
              <Card variant="default" className="bg-muted border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  📊 Branch Comparison
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={branchStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="messageCount"
                      fill="#3b82f6"
                      name="Messages Sent"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="deliveryRate"
                      fill="#10b981"
                      name="Delivery Rate (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Branch Statistics Table */}
            {branchStats.length > 0 && (
              <Card variant="default" className="overflow-hidden bg-muted border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  📋 Branch Details
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Branch
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Members
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Groups
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Messages
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Delivery Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {branchStats.map((branch) => (
                        <tr key={branch.id} className="hover:bg-muted/50 transition-colors duration-normal">
                          <td className="px-6 py-4 text-sm font-medium text-foreground">
                            {branch.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground/80">
                            {branch.memberCount}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground/80">
                            {branch.groupCount}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground/80">
                            {branch.messageCount}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-muted rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{
                                    width: `${branch.deliveryRate}%`,
                                  }}
                                />
                              </div>
                              <span className="font-medium text-foreground">
                                {branch.deliveryRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Message Stats Summary */}
            {messageStats && (
              <Card variant="default" className="bg-muted border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  💬 Message Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Total Messages</p>
                    <p className="text-2xl font-bold text-primary">
                      {messageStats.totalMessages}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Delivered</p>
                    <p className="text-2xl font-bold text-green-400">
                      {messageStats.deliveredCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Failed</p>
                    <p className="text-2xl font-bold text-red-400">
                      {messageStats.failedCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {messageStats.pendingCount}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getMessageStats,
  getBranchStats,
  getSummaryStats,
  MessageStats,
  BranchStats,
  SummaryStats,
} from '../../api/analytics';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
import { DynamicLineChart, DynamicBarChart } from '../../components/charts';
import { themeColors } from '../../utils/themeColors';
import { designTokens } from '../../utils/designTokens';

// Reusable tooltip style configuration
const tooltipStyle = {
  backgroundColor: themeColors.background.darkDim,
  border: `${designTokens.borderWidth.base} solid ${themeColors.border.darkDim}`,
  borderRadius: designTokens.borderRadius.md,
  color: themeColors.text.white,
};

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

  /**
   * Memoized summary stats for display
   * Prevents re-creating the stats array on every render
   * Only recalculates when summaryStats changes
   */
  const summaryStatsDisplay = useMemo(
    () =>
      summaryStats
        ? [
            { label: 'Total Messages', value: summaryStats.totalMessages, color: 'text-primary' },
            { label: 'Delivery Rate', value: `${summaryStats.averageDeliveryRate}%`, color: 'text-green-400' },
            { label: 'Total Members', value: summaryStats.totalMembers, color: 'text-blue-400' },
            { label: 'Branches', value: summaryStats.totalBranches, color: 'text-amber-400' },
            { label: 'Total Groups', value: summaryStats.totalGroups, color: 'text-red-400' },
          ]
        : [],
    [summaryStats]
  );

  /**
   * Memoized message stats for display
   * Prevents re-creating the stats array on every render
   * Only recalculates when messageStats changes
   */
  const messageStatsDisplay = useMemo(
    () =>
      messageStats
        ? [
            { label: 'Total Messages', value: messageStats.totalMessages, color: 'text-primary' },
            { label: 'Delivered', value: messageStats.deliveredCount, color: 'text-green-400' },
            { label: 'Failed', value: messageStats.failedCount, color: 'text-red-400' },
            { label: 'Pending', value: messageStats.pendingCount, color: 'text-amber-400' },
          ]
        : [],
    [messageStats]
  );

  /**
   * Memoized filtered branch stats for chart
   * Prevents recalculating branch data for chart rendering
   * Only recalculates when branchStats changes
   */
  const branchChartData = useMemo(
    () => branchStats.sort((a, b) => b.messageCount - a.messageCount),
    [branchStats]
  );

  /**
   * Memoized line chart configuration
   * Prevents recreating line configuration objects on every render
   * Only recalculates when chart data or theme colors change
   */
  const lineChartLines = useMemo(
    () => [
      {
        dataKey: 'count',
        stroke: themeColors.primary.base,
        name: 'Messages Sent',
      },
      {
        dataKey: 'delivered',
        stroke: themeColors.success.base,
        name: 'Delivered',
      },
      {
        dataKey: 'failed',
        stroke: themeColors.danger.base,
        name: 'Failed',
      },
    ],
    []
  );

  /**
   * Memoized bar chart configuration
   * Prevents recreating bar configuration objects on every render
   * Only recalculates when chart data or theme colors change
   */
  const barChartBars = useMemo(
    () => [
      {
        yAxisId: 'left',
        dataKey: 'messageCount',
        fill: themeColors.primary.base,
        name: 'Messages Sent',
      },
      {
        yAxisId: 'right',
        dataKey: 'deliveryRate',
        fill: themeColors.success.base,
        name: 'Delivery Rate (%)',
      },
    ],
    []
  );

  return (
    <SoftLayout>
      <div className="px-4 md:px-8 py-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8 flex-wrap gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Analytics</span>
            </h1>
            <p className="text-muted-foreground">Track your messaging performance and engagement</p>
          </div>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-normal backdrop-blur-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </motion.div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <Loader className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            {summaryStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {summaryStatsDisplay.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <SoftCard variant="gradient" className="text-center">
                      <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
                      <p className={`text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </SoftCard>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Message Volume Chart */}
            {messageStats && messageStats.byDay.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SoftCard>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Message Volume</h2>
                  <DynamicLineChart
                    data={messageStats.byDay}
                    height={300}
                    lines={lineChartLines}
                    tooltipStyle={tooltipStyle}
                    gridStroke={themeColors.border.dark}
                    fontSize={parseInt(designTokens.typography.fontSize.xs)}
                  />
                </SoftCard>
              </motion.div>
            )}

            {/* Branch Comparison */}
            {branchStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <SoftCard>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Branch Comparison</h2>
                  <DynamicBarChart
                    data={branchChartData}
                    height={300}
                    bars={barChartBars}
                    tooltipStyle={tooltipStyle}
                    gridStroke={themeColors.border.dark}
                    fontSize={parseInt(designTokens.typography.fontSize.xs)}
                    hasRightAxis={true}
                  />
                </SoftCard>
              </motion.div>
            )}

            {/* Branch Statistics Table */}
            {branchStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SoftCard className="overflow-hidden">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Branch Details</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="border-b border-border/40">
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
                      <tbody className="divide-y divide-border/40">
                        {branchChartData.map((branch, idx) => (
                          <motion.tr
                            key={branch.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            className="hover:bg-muted/30 transition-colors duration-normal"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-foreground">
                              {branch.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {branch.memberCount}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {branch.groupCount}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
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
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SoftCard>
              </motion.div>
            )}

            {/* Message Stats Summary */}
            {messageStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <SoftCard>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Message Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {messageStatsDisplay.map((stat, idx) => (
                      <div key={idx}>
                        <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </SoftCard>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </SoftLayout>
  );
}

export default AnalyticsPage;

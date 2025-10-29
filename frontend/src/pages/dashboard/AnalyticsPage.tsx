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
import {
  getMessageStats,
  getBranchStats,
  getSummaryStats,
  MessageStats,
  BranchStats,
  SummaryStats,
} from '../../api/analytics';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            {summaryStats && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm">Total Messages</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {summaryStats.totalMessages}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm">Avg Delivery Rate</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {summaryStats.averageDeliveryRate}%
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm">Total Members</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {summaryStats.totalMembers}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm">Total Branches</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {summaryStats.totalBranches}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm">Total Groups</p>
                  <p className="text-3xl font-bold text-pink-600 mt-2">
                    {summaryStats.totalGroups}
                  </p>
                </div>
              </div>
            )}

            {/* Message Volume Chart */}
            {messageStats && messageStats.byDay.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Message Volume
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={messageStats.byDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
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
              </div>
            )}

            {/* Branch Comparison */}
            {branchStats.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Branch Comparison
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={branchStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
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
              </div>
            )}

            {/* Branch Statistics Table */}
            {branchStats.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Branch Details
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Branch
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Members
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Groups
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Messages
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Delivery Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {branchStats.map((branch) => (
                        <tr key={branch.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {branch.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {branch.memberCount}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {branch.groupCount}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {branch.messageCount}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{
                                    width: `${branch.deliveryRate}%`,
                                  }}
                                />
                              </div>
                              <span className="font-medium text-gray-900">
                                {branch.deliveryRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Message Stats Summary */}
            {messageStats && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Message Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Total Messages</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {messageStats.totalMessages}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Delivered</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {messageStats.deliveredCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Failed</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {messageStats.failedCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                      {messageStats.pendingCount}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AnalyticsPage;

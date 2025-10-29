import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getActivityLogs } from '../../api/admin';

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  adminEmail: string;
}

interface ActivityLogsResponse {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function ActivityLogsPanel() {
  const [data, setData] = useState<ActivityLogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [currentPage]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const result = await getActivityLogs(currentPage, 50);
      setData(result);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p className="text-gray-500">Loading activity logs...</p>;
  }

  if (!data || data.logs.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">No activity logs yet</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Logs</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Action
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Details
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {log.action}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {log.details}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {log.adminEmail}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * data.pagination.limit + 1} to{' '}
            {Math.min(currentPage * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} logs
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              Page {currentPage} of {data.pagination.pages}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(data.pagination.pages, currentPage + 1))}
              disabled={currentPage === data.pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800">
          📋 <strong>Activity logs:</strong> All user actions are logged for security and compliance
          purposes. Logs are retained for 90 days.
        </p>
      </div>
    </div>
  );
}

export default ActivityLogsPanel;

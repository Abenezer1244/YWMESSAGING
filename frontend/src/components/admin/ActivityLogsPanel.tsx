import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { getActivityLogs } from '../../api/admin';
import { SoftCard, SoftButton } from '../SoftUI';

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
    return <div className="flex items-center justify-center py-8"><Loader className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  if (!data || data.logs.length === 0) {
    return (
      <SoftCard className="text-center py-12">
        <p className="text-muted-foreground">No activity logs yet</p>
      </SoftCard>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">Activity Logs</h2>

      <SoftCard className="mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-border/40">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {log.adminEmail}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SoftCard>

      {/* Pagination */}
      {data.pagination.pages > 1 && (
        <SoftCard className="mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * data.pagination.limit + 1} to{' '}
              {Math.min(currentPage * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} logs
            </div>
            <div className="flex gap-2">
              <SoftButton
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </SoftButton>
              <div className="px-4 py-2 text-sm text-muted-foreground font-medium">
                Page {currentPage} of {data.pagination.pages}
              </div>
              <SoftButton
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(Math.min(data.pagination.pages, currentPage + 1))}
                disabled={currentPage === data.pagination.pages}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </SoftButton>
            </div>
          </div>
        </SoftCard>
      )}

      {/* Info Box */}
      <SoftCard variant="gradient">
        <p className="text-sm text-foreground">
          ℹ️ <strong>Activity logs:</strong> All user actions are logged for security and compliance
          purposes. Logs are retained for 90 days.
        </p>
      </SoftCard>
    </div>
  );
}

export default ActivityLogsPanel;

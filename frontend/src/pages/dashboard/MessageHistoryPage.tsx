import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useMessageStore, { SentMessage } from '../../stores/messageStore';
import { getMessageHistory } from '../../api/messages';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui';

export function MessageHistoryPage() {
  const { messages, setMessages, isLoading, setLoading } = useMessageStore();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const limit = 20;
  const pages = Math.ceil(total / limit);

  useEffect(() => {
    loadMessages();
  }, [page, statusFilter]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessageHistory({
        page,
        limit,
        status: statusFilter || undefined,
      });
      setMessages(data.data);
      setTotal(data.pagination.total);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200';
      case 'pending':
        return 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200';
      case 'failed':
        return 'bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200';
      default:
        return 'bg-secondary-100 dark:bg-secondary-800 text-secondary-800 dark:text-secondary-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950 p-6 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-2">📜 Message History</h1>
          <p className="text-secondary-600 dark:text-secondary-400">{total} total messages</p>
        </div>

        {/* Filter */}
        <Card variant="default" className="mb-6">
          <label className="block text-sm font-semibold text-secondary-900 dark:text-secondary-50 mb-3">
            🔍 Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-normal"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </Card>

        {/* Messages Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" text="Loading messages..." />
          </div>
        ) : messages.length === 0 ? (
          <Card variant="highlight" className="text-center py-16">
            <div className="mb-6">
              <span className="text-6xl">📜</span>
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-3">
              No Messages Found
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400">
              Your message history will appear here after you send messages.
            </p>
          </Card>
        ) : (
          <>
            <Card variant="default" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-secondary-100 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                        Recipients
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                        Delivery
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                        Sent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                    {messages.map((message) => (
                      <tr key={message.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors duration-normal">
                        <td className="px-6 py-4">
                          <p className="text-sm text-secondary-900 dark:text-secondary-50 font-medium truncate max-w-xs">
                            {message.content.slice(0, 50)}
                            {message.content.length > 50 ? '...' : ''}
                          </p>
                          <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                            {message.targetType === 'individual'
                              ? 'Individual'
                              : message.targetType === 'groups'
                              ? 'Groups'
                              : message.targetType === 'branches'
                              ? 'Branches'
                              : 'All Members'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-900 dark:text-secondary-50 font-medium">
                            {message.totalRecipients}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <p className="text-secondary-900 dark:text-secondary-50 font-medium">
                              {message.deliveredCount}/{message.totalRecipients}
                            </p>
                            <p className="text-secondary-600 dark:text-secondary-400 text-xs">
                              {message.deliveryRate || 0}%
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                              message.status
                            )}`}
                          >
                            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600 dark:text-secondary-400">
                          {new Date(message.createdAt).toLocaleDateString()}
                          <br />
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  ← Previous
                </Button>
                <div className="px-4 py-2 text-secondary-700 dark:text-secondary-300 font-medium">
                  Page {page} of {pages}
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  disabled={page === pages}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MessageHistoryPage;

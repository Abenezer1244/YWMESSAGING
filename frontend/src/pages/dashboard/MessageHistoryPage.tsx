import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useMessageStore, { SentMessage } from '../../stores/messageStore';
import { getMessageHistory } from '../../api/messages';

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
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Message History</h1>
          <p className="text-gray-600 mt-1">{total} total messages</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Messages Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No messages found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Recipients
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Delivery
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Sent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {messages.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 font-medium truncate max-w-xs">
                            {message.content.slice(0, 50)}
                            {message.content.length > 50 ? '...' : ''}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
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
                          <div className="text-sm text-gray-900 font-medium">
                            {message.totalRecipients}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <p className="text-gray-900 font-medium">
                              {message.deliveredCount}/{message.totalRecipients}
                            </p>
                            <p className="text-gray-500 text-xs">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(message.createdAt).toLocaleDateString()}
                          <br />
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="px-4 py-2 text-gray-700">
                  Page {page} of {pages}
                </div>
                <button
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  disabled={page === pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default MessageHistoryPage;

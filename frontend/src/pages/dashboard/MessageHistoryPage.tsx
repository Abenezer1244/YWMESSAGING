import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useMessageStore, { SentMessage } from '../../stores/messageStore';
import { getMessageHistory } from '../../api/messages';
import BackButton from '../../components/BackButton';
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
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-700/50 text-slate-300';
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">📜 Message History</h1>
          <p className="text-foreground/80">{total} total messages</p>
        </div>

        {/* Filter */}
        <Card variant="default" className="mb-6 bg-muted border-border">
          <label className="block text-sm font-semibold text-foreground mb-3">
            🔍 Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-input rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-normal"
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
          <Card variant="highlight" className="text-center py-16 bg-muted border-border">
            <div className="mb-6">
              <span className="text-6xl">📜</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              No Messages Found
            </h2>
            <p className="text-foreground/80">
              Your message history will appear here after you send messages.
            </p>
          </Card>
        ) : (
          <>
            <Card variant="default" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-card border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Recipients
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Delivery
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Sent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {messages.map((message) => (
                      <tr key={message.id} className="hover:bg-muted/50 transition-colors duration-normal">
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground font-medium truncate max-w-xs">
                            {message.content.slice(0, 50)}
                            {message.content.length > 50 ? '...' : ''}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
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
                          <div className="text-sm text-foreground font-medium">
                            {message.totalRecipients}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <p className="text-foreground font-medium">
                              {message.deliveredCount}/{message.totalRecipients}
                            </p>
                            <p className="text-muted-foreground text-xs">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
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
                <div className="px-4 py-2 text-foreground/80 font-medium">
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

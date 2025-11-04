import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, History, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import useMessageStore, { SentMessage } from '../../stores/messageStore';
import { getMessageHistory } from '../../api/messages';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';

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
    <SoftLayout>
      <div className="px-4 md:px-8 py-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Message History</span>
          </h1>
          <p className="text-muted-foreground">{total} total messages</p>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SoftCard className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-normal backdrop-blur-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </SoftCard>
        </motion.div>

        {/* Messages Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Loader className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SoftCard variant="gradient" className="text-center py-16">
              <div className="mb-6">
                <History className="w-16 h-16 mx-auto text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                No Messages Found
              </h2>
              <p className="text-muted-foreground">
                Your message history will appear here after you send messages.
              </p>
            </SoftCard>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <SoftCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="border-b border-border/40">
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
                    <tbody className="divide-y divide-border/40">
                      {messages.map((message) => (
                        <tr key={message.id} className="hover:bg-muted/30 transition-colors duration-normal">
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
              </SoftCard>
            </motion.div>

            {/* Pagination */}
            {pages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex justify-center gap-2"
              >
                <SoftButton
                  variant="secondary"
                  size="md"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </SoftButton>
                <div className="px-4 py-2 text-muted-foreground font-medium">
                  Page {page} of {pages}
                </div>
                <SoftButton
                  variant="secondary"
                  size="md"
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  disabled={page === pages}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </SoftButton>
              </motion.div>
            )}
          </>
        )}
      </div>
    </SoftLayout>
  );
}

export default MessageHistoryPage;

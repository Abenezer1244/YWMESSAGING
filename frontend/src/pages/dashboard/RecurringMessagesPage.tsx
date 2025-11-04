import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, RefreshCw, Plus, Edit, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getRecurringMessages,
  deleteRecurringMessage,
  toggleRecurringMessage,
  RecurringMessage,
} from '../../api/recurring';
import RecurringMessageModal from '../../components/recurring/RecurringMessageModal';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';

export function RecurringMessagesPage() {
  const [messages, setMessages] = useState<RecurringMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<RecurringMessage | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await getRecurringMessages();
      setMessages(data);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load recurring messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMessage(null);
    setShowModal(true);
  };

  const handleEdit = (message: RecurringMessage) => {
    setEditingMessage(message);
    setShowModal(true);
  };

  const handleDelete = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this recurring message?')) {
      return;
    }

    try {
      await deleteRecurringMessage(messageId);
      setMessages(messages.filter((m) => m.id !== messageId));
      toast.success('Recurring message deleted');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to delete recurring message');
    }
  };

  const handleToggle = async (messageId: string, currentStatus: boolean) => {
    try {
      const updated = await toggleRecurringMessage(messageId, !currentStatus);
      setMessages(
        messages.map((m) => (m.id === messageId ? updated : m))
      );
      toast.success(
        !currentStatus ? 'Recurring message resumed' : 'Recurring message paused'
      );
    } catch (error) {
      toast.error((error as Error).message || 'Failed to toggle recurring message');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingMessage(null);
    loadMessages();
  };

  const formatNextSend = (nextSendAt: string) => {
    const date = new Date(nextSendAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `in ${diffDays}d ${diffHours}h`;
    } else if (diffHours > 0) {
      return `in ${diffHours}h`;
    } else {
      return 'soon';
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    };
    return labels[frequency] || frequency;
  };

  return (
    <SoftLayout>
      <div className="px-4 md:px-8 py-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Recurring Messages</span>
            </h1>
            <p className="text-muted-foreground">Automate regular communications</p>
          </div>
          <SoftButton
            variant="primary"
            size="lg"
            onClick={handleCreate}
            icon={<Plus className="w-5 h-5" />}
          >
            Create Recurring Message
          </SoftButton>
        </motion.div>

        {/* Main Content */}
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
            transition={{ delay: 0.1 }}
          >
            <SoftCard variant="gradient" className="text-center py-16">
              <div className="mb-6">
                <RefreshCw className="w-16 h-16 mx-auto text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                No Recurring Messages Yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create recurring messages to automatically send messages on a regular schedule.
              </p>
              <SoftButton
                variant="primary"
                size="md"
                onClick={handleCreate}
                icon={<Plus className="w-4 h-4" />}
              >
                Create First Message
              </SoftButton>
            </SoftCard>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {messages.map((message, index) => (
              <SoftCard
                key={message.id}
                index={index}
                className={!message.isActive ? 'opacity-75' : ''}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {message.name}
                    </h3>
                    <p className="text-sm text-foreground/80 mt-1">
                      {getFrequencyLabel(message.frequency)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(message.id, message.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      message.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}
                  >
                    {message.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {message.content}
                </p>

                <SoftCard variant="gradient" className="mb-4">
                  <p className="text-foreground text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <strong>Next send:</strong> {formatNextSend(message.nextSendAt)}
                  </p>
                  <p className="text-muted-foreground text-xs mt-2">
                    {new Date(message.nextSendAt).toLocaleString()}
                  </p>
                </SoftCard>

                <div className="flex gap-2">
                  <SoftButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(message)}
                    fullWidth
                    icon={<Edit className="w-3 h-3" />}
                  >
                    Edit
                  </SoftButton>
                  <SoftButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(message.id)}
                    fullWidth
                    icon={<Trash2 className="w-3 h-3" />}
                  >
                    Delete
                  </SoftButton>
                </div>
              </SoftCard>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <RecurringMessageModal
          message={editingMessage}
          onClose={handleModalClose}
        />
      )}
    </SoftLayout>
  );
}

export default RecurringMessagesPage;

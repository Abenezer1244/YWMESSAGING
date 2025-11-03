import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getRecurringMessages,
  deleteRecurringMessage,
  toggleRecurringMessage,
  RecurringMessage,
} from '../../api/recurring';
import RecurringMessageModal from '../../components/recurring/RecurringMessageModal';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui';

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
    <div className="min-h-screen bg-slate-950 p-6 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton variant="ghost" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🔄 Recurring Messages</h1>
            <p className="text-slate-300">Automate regular communications</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreate}
          >
            + Create Recurring Message
          </Button>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" text="Loading recurring messages..." />
          </div>
        ) : messages.length === 0 ? (
          <Card variant="highlight" className="text-center py-16 bg-slate-900/50 border-slate-700">
            <div className="mb-6">
              <span className="text-6xl">🔄</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              No Recurring Messages Yet
            </h2>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              Create recurring messages to automatically send messages on a regular schedule.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={handleCreate}
            >
              Create First Message
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {messages.map((message) => (
              <Card
                key={message.id}
                variant="default"
                className={`hover:shadow-lg transition-shadow bg-slate-900/50 border-slate-700 ${
                  !message.isActive ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {message.name}
                    </h3>
                    <p className="text-sm text-slate-300 mt-1">
                      {getFrequencyLabel(message.frequency)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(message.id, message.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      message.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {message.isActive ? '✅ Active' : '⏸️ Paused'}
                  </button>
                </div>

                <p className="text-primary-700 dark:text-primary-300 text-sm mb-4 line-clamp-2">
                  {message.content}
                </p>

                <Card variant="highlight" className="mb-4">
                  <p className="text-primary-900 dark:text-primary-50 text-sm">
                    <strong>⏱️ Next send:</strong> {formatNextSend(message.nextSendAt)}
                  </p>
                  <p className="text-primary-600 dark:text-primary-400 text-xs mt-2">
                    {new Date(message.nextSendAt).toLocaleString()}
                  </p>
                </Card>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(message)}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(message.id)}
                    fullWidth
                  >
                    Delete
                  </Button>
                </div>
              </Card>
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
    </div>
  );
}

export default RecurringMessagesPage;

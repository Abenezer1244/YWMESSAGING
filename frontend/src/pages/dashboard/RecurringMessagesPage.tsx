import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getRecurringMessages,
  deleteRecurringMessage,
  toggleRecurringMessage,
  RecurringMessage,
} from '../../api/recurring';
import RecurringMessageModal from '../../components/recurring/RecurringMessageModal';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Recurring Messages</h1>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Create Recurring Message
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading recurring messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No recurring messages yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  !message.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {message.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {getFrequencyLabel(message.frequency)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(message.id, message.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      message.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {message.content}
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
                  <p className="text-gray-700">
                    <strong>Next send:</strong> {formatNextSend(message.nextSendAt)}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    {new Date(message.nextSendAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(message)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="flex-1 px-3 py-2 border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-50 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useGroupStore from '../../stores/groupStore';
import useMessageStore from '../../stores/messageStore';
import { sendMessage } from '../../api/messages';
import { getTemplates, MessageTemplate } from '../../api/templates';
import TemplateFormModal from '../../components/templates/TemplateFormModal';

export function SendMessagePage() {
  const { groups } = useGroupStore();
  const { addMessage } = useMessageStore();

  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'groups' | 'all'>('groups');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  // Calculate segments and cost
  const segments = Math.ceil(content.length / 160) || 0;
  const totalCost = (segments * selectedGroupIds.length) * 0.0075;
  const recipientCount = selectedGroupIds.reduce(
    (sum, gId) => sum + (groups.find((g) => g.id === gId)?.memberCount || 0),
    0
  );

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleUseTemplate = (template: MessageTemplate) => {
    setContent(template.content);
    toast.success(`Using template: ${template.name}`);
  };

  const handleSendMessage = async () => {
    if (!content.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (targetType === 'groups' && selectedGroupIds.length === 0) {
      toast.error('Please select at least one group');
      return;
    }

    try {
      setIsLoading(true);

      const message = await sendMessage({
        content: content.trim(),
        targetType: targetType === 'all' ? 'all' : 'groups',
        targetIds: targetType === 'all' ? undefined : selectedGroupIds,
      });

      addMessage(message);
      toast.success(`Message queued for ${message.totalRecipients} recipients`);
      setContent('');
      setSelectedGroupIds([]);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Send Message</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          {/* Template Selector */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use Template
              </label>
              <div className="flex gap-2 flex-wrap">
                {templates.slice(0, 6).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleUseTemplate(template)}
                    className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 text-sm rounded-lg transition"
                    title={template.content}
                  >
                    {template.name}
                  </button>
                ))}
                {templates.length > 6 && (
                  <button
                    onClick={() => window.location.href = '/templates'}
                    className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 text-sm rounded-lg transition"
                  >
                    More Templates...
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Message Composer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 1600))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={6}
              placeholder="Type your message here..."
              maxLength={1600}
            />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>{content.length} / 1600 characters</span>
              <span>
                {segments} SMS segment{segments !== 1 ? 's' : ''}
                {segments > 0 && ` ($${(segments * 0.0075).toFixed(4)} per recipient)`}
              </span>
            </div>
            {content.trim() && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
              >
                💾 Save as Template
              </button>
            )}
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Send To
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="groups"
                  checked={targetType === 'groups'}
                  onChange={(e) => setTargetType(e.target.value as 'groups' | 'all')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Select Groups</span>
              </label>

              {targetType === 'groups' && (
                <div className="ml-7 space-y-2 bg-gray-50 p-4 rounded-lg">
                  {groups.length === 0 ? (
                    <p className="text-gray-500 text-sm">No groups available</p>
                  ) : (
                    groups.map((group) => (
                      <label
                        key={group.id}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroupIds.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {group.name} ({group.memberCount} members)
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={targetType === 'all'}
                  onChange={(e) => setTargetType(e.target.value as 'groups' | 'all')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">All Members</span>
              </label>
            </div>
          </div>

          {/* Cost Summary */}
          {(targetType === 'all' || selectedGroupIds.length > 0) && segments > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Recipients:</span>
                  <span className="font-medium">{recipientCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Segments:</span>
                  <span className="font-medium">{segments}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium text-gray-900">Estimated Cost:</span>
                  <span className="font-bold text-blue-600">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setContent('');
                setSelectedGroupIds([]);
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              Clear
            </button>
            <button
              onClick={handleSendMessage}
              disabled={
                isLoading ||
                !content.trim() ||
                (targetType === 'groups' && selectedGroupIds.length === 0)
              }
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {isLoading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </main>

      {showSaveModal && (
        <TemplateFormModal
          template={null}
          onClose={() => {
            setShowSaveModal(false);
            loadTemplates();
          }}
        />
      )}
    </div>
  );
}

export default SendMessagePage;

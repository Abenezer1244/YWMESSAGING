import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useGroupStore from '../../stores/groupStore';
import useMessageStore from '../../stores/messageStore';
import { sendMessage } from '../../api/messages';
import { getTemplates, MessageTemplate } from '../../api/templates';
import TemplateFormModal from '../../components/templates/TemplateFormModal';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui';

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
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 transition-colors duration-normal">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton variant="ghost" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">📨 Send Message</h1>
            <p className="text-slate-700 dark:text-slate-300">Reach your congregation with direct SMS messages</p>
          </div>
        </div>

        {/* Main Content */}
        <Card variant="default" className="space-y-6">
          {/* Template Selector */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-primary-900 dark:text-primary-50 mb-3">
                📋 Use Template
              </label>
              <div className="flex gap-2 flex-wrap">
                {templates.slice(0, 6).map((template) => (
                  <Button
                    key={template.id}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    title={template.content}
                  >
                    {template.name}
                  </Button>
                ))}
                {templates.length > 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/templates'}
                  >
                    More Templates...
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Message Composer */}
          <div>
            <label className="block text-sm font-semibold text-primary-900 dark:text-primary-50 mb-3">
              ✍️ Message Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 1600))}
              className="w-full px-4 py-3 border border-primary-200 dark:border-primary-700 rounded-lg bg-white dark:bg-primary-800 text-primary-900 dark:text-primary-50 placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none transition-colors duration-normal"
              rows={6}
              placeholder="Type your message here..."
              maxLength={1600}
            />
            <div className="flex justify-between mt-3 text-sm text-primary-600 dark:text-primary-400">
              <span>{content.length} / 1600 characters</span>
              <span>
                {segments} SMS segment{segments !== 1 ? 's' : ''}
                {segments > 0 && ` ($${(segments * 0.0075).toFixed(4)} per recipient)`}
              </span>
            </div>
            {content.trim() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveModal(true)}
                className="mt-2"
              >
                💾 Save as Template
              </Button>
            )}
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="block text-sm font-semibold text-primary-900 dark:text-primary-50 mb-3">
              👥 Send To
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="targetType"
                  value="groups"
                  checked={targetType === 'groups'}
                  onChange={(e) => setTargetType(e.target.value as 'groups' | 'all')}
                  className="w-4 h-4 accent-accent-500 dark:accent-accent-400 cursor-pointer"
                />
                <span className="text-sm font-medium text-primary-900 dark:text-primary-50">Select Groups</span>
              </label>

              {targetType === 'groups' && (
                <div className="ml-7 space-y-2 bg-primary-100 dark:bg-primary-800 p-4 rounded-lg border border-primary-200 dark:border-primary-700">
                  {groups.length === 0 ? (
                    <p className="text-primary-600 dark:text-primary-400 text-sm">No groups available</p>
                  ) : (
                    groups.map((group) => (
                      <label
                        key={group.id}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroupIds.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                          className="w-4 h-4 rounded accent-accent-500 dark:accent-accent-400 cursor-pointer"
                        />
                        <span className="text-sm text-primary-700 dark:text-primary-300">
                          {group.name} ({group.memberCount} members)
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={targetType === 'all'}
                  onChange={(e) => setTargetType(e.target.value as 'groups' | 'all')}
                  className="w-4 h-4 accent-accent-500 dark:accent-accent-400 cursor-pointer"
                />
                <span className="text-sm font-medium text-primary-900 dark:text-primary-50">All Members</span>
              </label>
            </div>
          </div>

          {/* Cost Summary */}
          {(targetType === 'all' || selectedGroupIds.length > 0) && segments > 0 && (
            <Card variant="highlight">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-700 dark:text-primary-300">Recipients:</span>
                  <span className="font-medium text-primary-900 dark:text-primary-50">{recipientCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700 dark:text-primary-300">Segments:</span>
                  <span className="font-medium text-primary-900 dark:text-primary-50">{segments}</span>
                </div>
                <div className="flex justify-between border-t border-primary-200 dark:border-primary-700 pt-2">
                  <span className="font-medium text-primary-900 dark:text-primary-50">Estimated Cost:</span>
                  <span className="font-bold text-accent-600 dark:text-accent-400">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Send Button */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setContent('');
                setSelectedGroupIds([]);
              }}
              disabled={isLoading}
            >
              🗑️ Clear
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handleSendMessage}
              disabled={
                isLoading ||
                !content.trim() ||
                (targetType === 'groups' && selectedGroupIds.length === 0)
              }
              isLoading={isLoading}
            >
              {isLoading ? 'Sending...' : '✉️ Send Message'}
            </Button>
          </div>
        </Card>
      </div>

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

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getTemplates, deleteTemplate, MessageTemplate } from '../../api/templates';
import TemplateFormModal from '../../components/templates/TemplateFormModal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui';

export function TemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setShowModal(true);
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleDelete = async (templateId: string, isDefault: boolean) => {
    if (isDefault) {
      toast.error('Cannot delete default templates');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await deleteTemplate(templateId);
      setTemplates(templates.filter((t) => t.id !== templateId));
      toast.success('Template deleted');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to delete template');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTemplate(null);
    loadTemplates();
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      service_reminder: 'Service Reminder',
      event: 'Event',
      prayer: 'Prayer',
      thank_you: 'Thank You',
      welcome: 'Welcome',
      offering: 'Offering',
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 dark:from-primary-900 to-primary-100 dark:to-primary-950 p-6 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-900 dark:text-primary-50 mb-2">📋 Message Templates</h1>
            <p className="text-primary-600 dark:text-primary-400">Reuse message templates to save time</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreate}
          >
            + Create Template
          </Button>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" text="Loading templates..." />
          </div>
        ) : templates.length === 0 ? (
          <Card variant="highlight" className="text-center py-16">
            <div className="mb-6">
              <span className="text-6xl">📋</span>
            </div>
            <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-50 mb-3">
              No Templates Yet
            </h2>
            <p className="text-primary-600 dark:text-primary-400 mb-6 max-w-md mx-auto">
              Create templates to quickly send frequently used messages.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={handleCreate}
            >
              Create First Template
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                variant="default"
                className="hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-50">
                      {template.name}
                    </h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                      {getCategoryLabel(template.category)}
                    </p>
                  </div>
                  {template.isDefault && (
                    <span className="inline-block px-2 py-1 bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-200 text-xs font-semibold rounded">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-primary-700 dark:text-primary-300 text-sm mb-4 flex-grow line-clamp-3">
                  {template.content}
                </p>

                <div className="flex justify-between items-center mb-4 pt-4 border-t border-primary-200 dark:border-primary-700">
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    Used {template.usageCount} times
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(template.id, template.isDefault)}
                    disabled={template.isDefault}
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
        <TemplateFormModal
          template={editingTemplate}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default TemplatesPage;

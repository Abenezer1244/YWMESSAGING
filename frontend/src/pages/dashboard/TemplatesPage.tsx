import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getTemplates, deleteTemplate, MessageTemplate } from '../../api/templates';
import TemplateFormModal from '../../components/templates/TemplateFormModal';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Message Templates</h1>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Create Template
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No templates found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow p-6 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {getCategoryLabel(template.category)}
                    </p>
                  </div>
                  {template.isDefault && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-gray-700 text-sm mb-4 flex-grow line-clamp-3">
                  {template.content}
                </p>

                <div className="flex justify-between items-center mb-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Used {template.usageCount} times
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template.id, template.isDefault)}
                    disabled={template.isDefault}
                    className="flex-1 px-3 py-2 border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
        <TemplateFormModal
          template={editingTemplate}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default TemplatesPage;

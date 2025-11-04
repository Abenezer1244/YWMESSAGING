import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTemplates, deleteTemplate, MessageTemplate } from '../../api/templates';
import TemplateFormModal from '../../components/templates/TemplateFormModal';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
import AnimatedBlobs from '../../components/AnimatedBlobs';

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
    <SoftLayout>
      <AnimatedBlobs variant="minimal" />
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
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Message Templates</span>
            </h1>
            <p className="text-muted-foreground">Reuse message templates to save time</p>
          </div>
          <SoftButton
            variant="primary"
            size="lg"
            onClick={handleCreate}
            icon={<Plus className="w-5 h-5" />}
          >
            Create Template
          </SoftButton>
        </motion.div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Loader className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        ) : templates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <SoftCard variant="gradient" className="text-center py-16">
              <div className="mb-6">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                No Templates Yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create templates to quickly send frequently used messages.
              </p>
              <SoftButton
                variant="primary"
                size="md"
                onClick={handleCreate}
                icon={<Plus className="w-4 h-4" />}
              >
                Create First Template
              </SoftButton>
            </SoftCard>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <SoftCard
                key={template.id}
                index={index}
                className="flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {template.name}
                    </h3>
                    <p className="text-sm text-foreground/80 mt-1">
                      {getCategoryLabel(template.category)}
                    </p>
                  </div>
                  {template.isDefault && (
                    <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-3">
                  {template.content}
                </p>

                <div className="flex justify-between items-center mb-4 pt-4 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">
                    Used {template.usageCount} times
                  </p>
                </div>

                <div className="flex gap-2">
                  <SoftButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    fullWidth
                    icon={<Edit className="w-3 h-3" />}
                  >
                    Edit
                  </SoftButton>
                  <SoftButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(template.id, template.isDefault)}
                    disabled={template.isDefault}
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
        <TemplateFormModal
          template={editingTemplate}
          onClose={handleModalClose}
        />
      )}
    </SoftLayout>
  );
}

export default TemplatesPage;

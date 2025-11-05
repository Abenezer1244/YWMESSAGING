import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createTemplate, updateTemplate, MessageTemplate } from '../../api/templates';

interface TemplateFormModalProps {
  template?: MessageTemplate | null;
  onClose: () => void;
}

export default function TemplateFormModal({ template, onClose }: TemplateFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: template
      ? {
          name: template.name,
          content: template.content,
          category: template.category,
        }
      : {
          name: '',
          content: '',
          category: 'event',
        },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      if (template) {
        await updateTemplate(template.id, data);
        toast.success('Template updated');
      } else {
        await createTemplate(data);
        toast.success('Template created');
      }
      onClose();
    } catch (error) {
      toast.error((error as Error).message || 'Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {template ? 'Edit Template' : 'Create Template'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template Name
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Sunday Reminder"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="service_reminder">Service Reminder</option>
              <option value="event">Event</option>
              <option value="prayer">Prayer</option>
              <option value="thank_you">Thank You</option>
              <option value="welcome">Welcome</option>
              <option value="offering">Offering</option>
            </select>
            {errors.category && (
              <p className="text-red-600 text-sm mt-1">
                {errors.category.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={6}
              placeholder="Message content..."
            />
            {errors.content && (
              <p className="text-red-600 text-sm mt-1">
                {errors.content.message as string}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

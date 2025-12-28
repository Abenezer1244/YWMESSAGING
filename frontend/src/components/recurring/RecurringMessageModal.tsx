import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createRecurringMessage, updateRecurringMessage, RecurringMessage } from '../../api/recurring';

interface RecurringMessageModalProps {
  message?: RecurringMessage | null;
  onClose: () => void;
}

interface FormData {
  name: string;
  content: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  timeOfDay: string;
  dayOfWeek: number;
}

export default function RecurringMessageModal({ message, onClose }: RecurringMessageModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: message
      ? {
          name: message.name,
          content: message.content,
          frequency: message.frequency as any,
          timeOfDay: message.timeOfDay || '09:00',
          dayOfWeek: message.dayOfWeek || 0,
        }
      : {
          name: '',
          content: '',
          frequency: 'daily',
          timeOfDay: '09:00',
          dayOfWeek: 0,
        },
  });

  const frequency = watch('frequency');

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const payload: any = {
        name: data.name,
        content: data.content,
        targetType: 'all',
        frequency: data.frequency,
        timeOfDay: data.timeOfDay,
        dayOfWeek: data.frequency === 'weekly' ? data.dayOfWeek : undefined,
      };

      if (message) {
        await updateRecurringMessage(message.id, payload);
        toast.success('Recurring message updated');
      } else {
        await createRecurringMessage(payload);
        toast.success('Recurring message created');
      }
      onClose();
    } catch (error) {
      toast.error((error as Error).message || 'Failed to save recurring message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {message ? 'Edit Recurring Message' : 'Create Recurring Message'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
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
              Content *
            </label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Message content..."
            />
            {errors.content && (
              <p className="text-red-600 text-sm mt-1">{errors.content.message as string}</p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Messages will be sent to all members
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency *
            </label>
            <select
              {...register('frequency')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Day of Week *
              </label>
              <select
                {...register('dayOfWeek', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time of Day *
            </label>
            <input
              {...register('timeOfDay')}
              type="time"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

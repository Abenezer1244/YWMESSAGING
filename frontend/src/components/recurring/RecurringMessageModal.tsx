import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useGroupStore from '../../stores/groupStore';
import { createRecurringMessage, updateRecurringMessage, RecurringMessage } from '../../api/recurring';

interface RecurringMessageModalProps {
  message?: RecurringMessage | null;
  onClose: () => void;
}

interface FormData {
  name: string;
  content: string;
  targetType: 'groups' | 'all';
  selectedGroupIds: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  timeOfDay: string;
  dayOfWeek: number;
}

export default function RecurringMessageModal({ message, onClose }: RecurringMessageModalProps) {
  const { groups } = useGroupStore();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: message
      ? {
          name: message.name,
          content: message.content,
          targetType: message.targetType === 'all' ? 'all' : 'groups',
          selectedGroupIds: message.targetIds ? JSON.parse(message.targetIds) : [],
          frequency: message.frequency as any,
          timeOfDay: message.timeOfDay || '09:00',
          dayOfWeek: message.dayOfWeek || 0,
        }
      : {
          name: '',
          content: '',
          targetType: 'groups',
          selectedGroupIds: [],
          frequency: 'daily',
          timeOfDay: '09:00',
          dayOfWeek: 0,
        },
  });

  const targetType = watch('targetType');
  const selectedGroupIds = watch('selectedGroupIds');
  const frequency = watch('frequency');

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const payload: any = {
        name: data.name,
        content: data.content,
        targetType: data.targetType === 'all' ? 'all' : 'groups',
        targetIds: data.targetType === 'all' ? undefined : data.selectedGroupIds,
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {message ? 'Edit Recurring Message' : 'Create Recurring Message'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Sunday Reminder"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Message content..."
            />
            {errors.content && (
              <p className="text-red-600 text-sm mt-1">{errors.content.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send To *
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input {...register('targetType')} type="radio" value="groups" />
                <span className="text-sm">Select Groups</span>
              </label>

              {targetType === 'groups' && (
                <div className="ml-6 space-y-1 bg-gray-50 p-2 rounded">
                  {groups.map((group) => (
                    <label key={group.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={group.id}
                        {...register('selectedGroupIds')}
                      />
                      <span className="text-sm">{group.name}</span>
                    </label>
                  ))}
                </div>
              )}

              <label className="flex items-center gap-2">
                <input {...register('targetType')} type="radio" value="all" />
                <span className="text-sm">All Members</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency *
            </label>
            <select
              {...register('frequency')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week *
              </label>
              <select
                {...register('dayOfWeek', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time of Day *
            </label>
            <input
              {...register('timeOfDay')}
              type="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
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

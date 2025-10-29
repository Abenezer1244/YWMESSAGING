import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Group } from '../../stores/groupStore';
import { createGroup, updateGroup } from '../../api/groups';

interface GroupFormModalProps {
  isOpen: boolean;
  group?: Group;
  branchId: string;
  onClose: () => void;
  onSuccess: (group: Group) => void;
}

interface FormData {
  name: string;
  description: string;
  welcomeMessageEnabled: boolean;
  welcomeMessageText: string;
}

export function GroupFormModal({ isOpen, group, branchId, onClose, onSuccess }: GroupFormModalProps) {
  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: {
      name: group?.name || '',
      description: group?.description || '',
      welcomeMessageEnabled: group?.welcomeMessageEnabled || false,
      welcomeMessageText: group?.welcomeMessageText || '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const welcomeEnabled = watch('welcomeMessageEnabled');

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      if (group) {
        // Update existing group
        const updated = await updateGroup(group.id, {
          name: data.name,
          description: data.description || undefined,
          welcomeMessageEnabled: data.welcomeMessageEnabled,
          welcomeMessageText: data.welcomeMessageText || undefined,
        });
        toast.success('Group updated successfully');
        onSuccess(updated);
      } else {
        // Create new group
        const created = await createGroup(branchId, {
          name: data.name,
          description: data.description || undefined,
          welcomeMessageEnabled: data.welcomeMessageEnabled,
          welcomeMessageText: data.welcomeMessageText || undefined,
        });
        toast.success('Group created successfully');
        onSuccess(created);
      }

      reset();
      onClose();
    } catch (error) {
      toast.error((error as Error).message || 'Failed to save group');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {group ? 'Edit Group' : 'Create Group'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name *
            </label>
            <input
              type="text"
              {...register('name', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Young Adults"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional group description"
              rows={3}
            />
          </div>

          <div className="space-y-3 border-t pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('welcomeMessageEnabled')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Send welcome message when members join
              </span>
            </label>

            {welcomeEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome Message
                </label>
                <textarea
                  {...register('welcomeMessageText')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter welcome message text"
                  rows={3}
                />
              </div>
            )}
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

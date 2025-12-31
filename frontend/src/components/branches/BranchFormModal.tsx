import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createBranch, updateBranch, CreateBranchInput } from '../../api/branches';
import { Branch } from '../../stores/branchStore';

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (branch: Branch) => void;
  churchId: string;
  branch?: Branch; // If provided, we're editing
}

interface FormData extends CreateBranchInput {}

export function BranchFormModal({
  isOpen,
  onClose,
  onSuccess,
  churchId,
  branch,
}: BranchFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: branch?.name || '',
      address: branch?.address || '',
      phone: branch?.phone || '',
      description: branch?.description || '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: FormData) => {
    if (!data.name || !data.name.trim()) {
      toast.error('Branch name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      let result: Branch;

      if (branch) {
        result = await updateBranch(branch.id, data);
        toast.success('Branch updated successfully');
      } else {
        result = await createBranch(churchId, data);
        toast.success('Branch created successfully');
      }

      reset();
      onSuccess(result);
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to save branch';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pointer-events-none">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full pointer-events-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {branch ? 'Edit Branch' : 'Create New Branch'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Branch name is required' })}
                placeholder="e.g., Main Location, Downtown Campus"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                {...register('address')}
                placeholder="123 Main St, City, State"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                {...register('phone')}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                placeholder="Additional details about this branch..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:bg-gray-100 dark:disabled:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {isSubmitting ? 'Saving...' : branch ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BranchFormModal;

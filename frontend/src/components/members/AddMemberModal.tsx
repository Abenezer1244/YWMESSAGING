import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Member, addMember } from '../../api/members';

interface AddMemberModalProps {
  isOpen: boolean;
  groupId: string;
  onClose: () => void;
  onSuccess: (member: Member) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export function AddMemberModal({ isOpen, groupId, onClose, onSuccess }: AddMemberModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      // Trim and validate form data
      const firstName = data.firstName?.trim();
      const lastName = data.lastName?.trim();
      const phone = data.phone?.trim();

      if (!firstName || !lastName || !phone) {
        toast.error('First name, last name, and phone are required');
        return;
      }

      const member = await addMember(groupId, {
        firstName,
        lastName,
        phone,
        email: data.email?.trim() || undefined,
      });

      onSuccess(member);
      reset();
      onClose();
    } catch (error) {
      toast.error((error as Error).message || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Member</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name * {errors.firstName && <span className="text-red-500">Required</span>}
              </label>
              <input
                type="text"
                {...register('firstName', { required: 'First name is required' })}
                autoComplete="given-name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name * {errors.lastName && <span className="text-red-500">Required</span>}
              </label>
              <input
                type="text"
                {...register('lastName', { required: 'Last name is required' })}
                autoComplete="family-name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number * {errors.phone && <span className="text-red-500">Required</span>}
            </label>
            <input
              type="tel"
              {...register('phone', { required: 'Phone is required' })}
              autoComplete="tel"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(202) 555-0173"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Any phone format</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              {...register('email')}
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
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
              {isLoading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

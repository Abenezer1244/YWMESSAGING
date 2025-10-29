import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getCoAdmins, removeCoAdmin } from '../../api/admin';

interface CoAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export function CoAdminPanel() {
  const [coAdmins, setCoAdmins] = useState<CoAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadCoAdmins();
  }, []);

  const loadCoAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await getCoAdmins();
      setCoAdmins(data);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load co-admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (adminId: string) => {
    if (!confirm('Are you sure you want to remove this co-admin? They will lose access immediately.')) {
      return;
    }

    try {
      setIsRemoving(adminId);
      await removeCoAdmin(adminId);
      toast.success('Co-admin removed successfully');
      loadCoAdmins();
    } catch (error) {
      toast.error((error as Error).message || 'Failed to remove co-admin');
    } finally {
      setIsRemoving(null);
    }
  };

  if (isLoading) {
    return <p className="text-gray-500">Loading co-admins...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Co-Admin Management</h2>

      {coAdmins.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No co-admins yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Co-admins will be listed here once you invite them
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Added
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {admin.firstName} {admin.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {admin.lastLoginAt
                      ? new Date(admin.lastLoginAt).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleRemove(admin.id)}
                      disabled={isRemoving === admin.id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 font-medium"
                    >
                      {isRemoving === admin.id ? 'Removing...' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Co-Admin Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Co-admins can manage branches, groups, members, and messages.
          They cannot manage billing or other co-admins.
        </p>
      </div>
    </div>
  );
}

export default CoAdminPanel;

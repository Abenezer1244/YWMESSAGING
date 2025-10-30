import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getCoAdmins, removeCoAdmin, inviteCoAdmin } from '../../api/admin';

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
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ admin: CoAdmin; tempPassword: string } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsInviting(true);
      const result = await inviteCoAdmin({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      setInviteResult(result.data);
      setFormData({ email: '', firstName: '', lastName: '' });
      toast.success('Co-admin invited successfully');
      loadCoAdmins();
    } catch (error) {
      toast.error((error as Error).message || 'Failed to invite co-admin');
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return <p className="text-gray-500">Loading co-admins...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Co-Admin Management</h2>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          {showInviteForm ? 'Cancel' : 'Invite Co-Admin'}
        </button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite New Co-Admin</h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="John"
                  disabled={isInviting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Doe"
                  disabled={isInviting}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="john.doe@example.com"
                disabled={isInviting}
              />
            </div>
            <button
              type="submit"
              disabled={isInviting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {isInviting ? 'Inviting...' : 'Send Invite'}
            </button>
          </form>
        </div>
      )}

      {/* Invite Result - Show Temporary Password */}
      {inviteResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Co-Admin Invited Successfully!</h3>
          <p className="text-sm text-green-800 mb-4">
            Share the following credentials with <strong>{inviteResult.admin.email}</strong>:
          </p>
          <div className="bg-white border border-green-300 rounded p-4 mb-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Email:</strong> {inviteResult.admin.email}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Temporary Password:</strong>
              <code className="ml-2 bg-gray-100 px-2 py-1 rounded font-mono text-green-700">
                {inviteResult.tempPassword}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteResult.tempPassword);
                  toast.success('Password copied to clipboard');
                }}
                className="ml-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Copy
              </button>
            </p>
          </div>
          <p className="text-sm text-green-700 mb-4">
            They can log in with this temporary password and change it after first login.
          </p>
          <button
            onClick={() => setInviteResult(null)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Done
          </button>
        </div>
      )}

      {/* Co-Admins List */}
      {coAdmins.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No co-admins yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Click "Invite Co-Admin" to add your first co-admin
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto mb-6">
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

      {/* Co-Admin Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Co-admins can manage branches, groups, members, and messages.
          They cannot manage billing or other co-admins.
        </p>
      </div>
    </div>
  );
}

export default CoAdminPanel;

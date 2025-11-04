import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Trash2, UserPlus, Loader } from 'lucide-react';
import { getCoAdmins, removeCoAdmin, inviteCoAdmin } from '../../api/admin';
import { SoftCard, SoftButton } from '../SoftUI';

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
    return <div className="flex items-center justify-center py-8"><Loader className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Co-Admin Management</h2>
        <SoftButton
          variant="primary"
          onClick={() => setShowInviteForm(!showInviteForm)}
          icon={<UserPlus className="w-4 h-4" />}
        >
          {showInviteForm ? 'Cancel' : 'Invite Co-Admin'}
        </SoftButton>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <SoftCard className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Invite New Co-Admin</h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-normal backdrop-blur-sm"
                  placeholder="John"
                  disabled={isInviting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-normal backdrop-blur-sm"
                  placeholder="Doe"
                  disabled={isInviting}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-normal backdrop-blur-sm"
                placeholder="john.doe@example.com"
                disabled={isInviting}
              />
            </div>
            <SoftButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={isInviting}
            >
              {isInviting ? 'Inviting...' : 'Send Invite'}
            </SoftButton>
          </form>
        </SoftCard>
      )}

      {/* Invite Result - Show Temporary Password */}
      {inviteResult && (
        <SoftCard variant="gradient" className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Co-Admin Invited Successfully!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Share the following credentials with <strong>{inviteResult.admin.email}</strong>:
          </p>
          <SoftCard className="mb-4">
            <p className="text-sm text-foreground mb-2">
              <strong>Email:</strong> {inviteResult.admin.email}
            </p>
            <p className="text-sm text-foreground mb-2">
              <strong>Temporary Password:</strong>
              <code className="ml-2 bg-muted/50 px-2 py-1 rounded font-mono text-primary">
                {inviteResult.tempPassword}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteResult.tempPassword);
                  toast.success('Password copied to clipboard');
                }}
                className="ml-2 text-primary hover:text-primary/80 text-sm font-medium"
              >
                Copy
              </button>
            </p>
          </SoftCard>
          <p className="text-sm text-muted-foreground mb-4">
            They can log in with this temporary password and change it after first login.
          </p>
          <SoftButton
            variant="primary"
            onClick={() => setInviteResult(null)}
          >
            Done
          </SoftButton>
        </SoftCard>
      )}

      {/* Co-Admins List */}
      {coAdmins.length === 0 ? (
        <SoftCard className="text-center py-12 mb-6">
          <p className="text-muted-foreground">No co-admins yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Click "Invite Co-Admin" to add your first co-admin
          </p>
        </SoftCard>
      ) : (
        <SoftCard className="mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-border/40">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Added
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {coAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {admin.firstName} {admin.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {admin.lastLoginAt
                        ? new Date(admin.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleRemove(admin.id)}
                        disabled={isRemoving === admin.id}
                        className="inline-flex items-center gap-1 text-danger hover:text-danger/80 disabled:opacity-50 font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isRemoving === admin.id ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SoftCard>
      )}

      {/* Co-Admin Info */}
      <SoftCard variant="gradient">
        <p className="text-sm text-foreground">
          ℹ️ <strong>Tip:</strong> Co-admins can manage branches, groups, members, and messages.
          They cannot manage billing or other co-admins.
        </p>
      </SoftCard>
    </div>
  );
}

export default CoAdminPanel;

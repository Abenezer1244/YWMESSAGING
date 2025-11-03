import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';
import useBranchStore, { Branch } from '../../stores/branchStore';
import { getBranches, deleteBranch } from '../../api/branches';
import BranchFormModal from '../../components/branches/BranchFormModal';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui';

export function BranchesPage() {
  const auth = useAuthStore();
  const { branches, setBranches, addBranch, updateBranch, removeBranch, isLoading, setLoading } = useBranchStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | undefined>(undefined);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load branches on component mount
  useEffect(() => {
    if (auth.church?.id) {
      loadBranches();
    }
  }, [auth.church?.id]);

  const loadBranches = async () => {
    if (!auth.church?.id) return;

    setLoading(true);
    try {
      const data = await getBranches(auth.church.id);
      setBranches(data);
    } catch (error: any) {
      console.error('Failed to load branches:', error);
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBranch(undefined);
    setModalOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setModalOpen(true);
  };

  const handleModalSuccess = (branch: Branch) => {
    if (editingBranch) {
      updateBranch(branch.id, branch);
    } else {
      addBranch(branch);
    }
  };

  const handleDelete = async (branchId: string) => {
    if (!window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }

    setDeleting(branchId);
    try {
      const result = await deleteBranch(branchId);
      removeBranch(branchId);
      toast.success(
        `Branch deleted. ${result.groupsDeleted} group(s) and ${result.membersDeleted} member(s) were removed.`
      );
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete branch';
      toast.error(message);
    } finally {
      setDeleting(null);
    }
  };

  if (isLoading && branches.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-6 flex items-center justify-center">
        <Spinner size="lg" text="Loading branches..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton variant="ghost" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">📍 Branches</h1>
            <p className="text-slate-700 dark:text-slate-300">Manage your church locations</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreate}
          >
            + New Branch
          </Button>
        </div>

        {branches.length === 0 ? (
          <Card variant="highlight" className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700">
            <div className="mb-6">
              <span className="text-6xl">📍</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              No Branches Yet
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6 max-w-md mx-auto">
              Create your first branch to start managing your church locations and organizing your congregation.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={handleCreate}
            >
              Create Your First Branch
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <Card key={branch.id} variant="default" className="hover:shadow-lg transition-shadow bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{branch.name}</h3>
                  {branch.description && (
                    <p className="text-sm text-slate-700 dark:text-slate-300">{branch.description}</p>
                  )}
                </div>

                <div className="space-y-2 mb-6 pb-6 border-b border-slate-300 dark:border-slate-700">
                  {branch.address && (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium">📍</span> {branch.address}
                    </p>
                  )}
                  {branch.phone && (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium">📞</span> {branch.phone}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent-400">{branch.groupCount}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Groups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent-400">{branch.memberCount}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Members</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(branch)}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(branch.id)}
                    disabled={deleting === branch.id || branches.length === 1}
                    fullWidth
                  >
                    {deleting === branch.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BranchFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        churchId={auth.church?.id || ''}
        branch={editingBranch}
      />
    </div>
  );
}

export default BranchesPage;

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';
import useBranchStore, { Branch } from '../../stores/branchStore';
import { getBranches, deleteBranch } from '../../api/branches';
import BranchFormModal from '../../components/branches/BranchFormModal';

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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Branches</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Create Branch
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No branches yet. Create your first branch to get started.</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Your First Branch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{branch.name}</h3>

              {branch.address && (
                <p className="text-sm text-gray-600 mb-1">📍 {branch.address}</p>
              )}

              {branch.phone && (
                <p className="text-sm text-gray-600 mb-3">📞 {branch.phone}</p>
              )}

              {branch.description && (
                <p className="text-sm text-gray-500 mb-4">{branch.description}</p>
              )}

              <div className="border-t pt-4 mb-4 flex gap-4">
                <div className="flex-1">
                  <p className="text-2xl font-bold text-blue-600">{branch.groupCount}</p>
                  <p className="text-xs text-gray-500">Groups</p>
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-green-600">{branch.memberCount}</p>
                  <p className="text-xs text-gray-500">Members</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(branch)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(branch.id)}
                  disabled={deleting === branch.id || branches.length === 1}
                  className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {deleting === branch.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

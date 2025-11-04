import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';
import useBranchStore, { Branch } from '../../stores/branchStore';
import { getBranches, deleteBranch } from '../../api/branches';
import BranchFormModal from '../../components/branches/BranchFormModal';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';

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
      <SoftLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
            <Loader className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </SoftLayout>
    );
  }

  return (
    <SoftLayout>
      <div className="px-4 md:px-8 py-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Branches</span>
            </h1>
            <p className="text-muted-foreground">Manage your church locations</p>
          </div>
          <SoftButton
            variant="primary"
            size="lg"
            onClick={handleCreate}
          >
            New Branch
          </SoftButton>
        </motion.div>

        {branches.length === 0 ? (
          <SoftCard className="text-center py-16">
            <div className="mb-6">
              <MapPin className="w-16 h-16 text-muted-foreground/50 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              No Branches Yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first branch to start managing your church locations and organizing your congregation.
            </p>
            <SoftButton
              variant="primary"
              onClick={handleCreate}
            >
              Create Your First Branch
            </SoftButton>
          </SoftCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch, idx) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <SoftCard variant="default">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-2">{branch.name}</h3>
                    {branch.description && (
                      <p className="text-sm text-muted-foreground">{branch.description}</p>
                    )}
                  </div>

                  <div className="space-y-2 mb-6 pb-6 border-b border-border/40">
                    {branch.address && (
                      <p className="text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        {branch.address}
                      </p>
                    )}
                    {branch.phone && (
                      <p className="text-sm text-muted-foreground">
                        📞 {branch.phone}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{branch.groupCount}</p>
                      <p className="text-xs text-muted-foreground uppercase">Groups</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{branch.memberCount}</p>
                      <p className="text-xs text-muted-foreground uppercase">Members</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <SoftButton
                      variant="secondary"
                      onClick={() => handleEdit(branch)}
                      fullWidth
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </SoftButton>
                    <SoftButton
                      variant="danger"
                      onClick={() => handleDelete(branch.id)}
                      disabled={deleting === branch.id || branches.length === 1}
                      fullWidth
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting === branch.id ? 'Deleting...' : 'Delete'}
                    </SoftButton>
                  </div>
                </SoftCard>
              </motion.div>
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
    </SoftLayout>
  );
}

export default BranchesPage;

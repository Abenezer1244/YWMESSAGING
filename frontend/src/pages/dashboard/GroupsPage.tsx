import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Loader, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import useGroupStore, { Group } from '../../stores/groupStore';
import { getGroups, deleteGroup } from '../../api/groups';
import { GroupFormModal } from '../../components/groups/GroupFormModal';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
import AnimatedBlobs from '../../components/AnimatedBlobs';

export function GroupsPage() {
  const { branchId = '' } = useParams();
  const { groups, setGroups, isLoading, setLoading } = useGroupStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, [branchId]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await getGroups(branchId);
      setGroups(data);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingGroup(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (group: Group) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (groupId: string) => {
    try {
      await deleteGroup(groupId);
      toast.success('Group deleted successfully');
      setDeleteConfirm(null);
      await loadGroups();
    } catch (error) {
      toast.error((error as Error).message || 'Failed to delete group');
    }
  };

  const handleModalSuccess = (group: Group) => {
    if (editingGroup) {
      // Update existing
      setGroups(groups.map((g) => (g.id === group.id ? group : g)));
    } else {
      // Add new
      setGroups([group, ...groups]);
    }
  };

  if (isLoading) {
    return (
      <SoftLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
            <Loader className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </SoftLayout>
    );
  }

  return (
    <SoftLayout>
      <AnimatedBlobs variant="minimal" />
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
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Groups</span>
            </h1>
            <p className="text-muted-foreground">{groups.length} groups in this branch</p>
          </div>
          <SoftButton
            variant="primary"
            size="lg"
            onClick={handleCreateClick}
          >
            New Group
          </SoftButton>
        </motion.div>

        {/* Main Content */}
        {groups.length === 0 ? (
          <SoftCard className="text-center py-16">
            <div className="mb-6">
              <Users className="w-16 h-16 text-muted-foreground/50 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              No Groups Yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first group to start organizing your congregation.
            </p>
            <SoftButton
              variant="primary"
              onClick={handleCreateClick}
            >
              Create First Group
            </SoftButton>
          </SoftCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group, idx) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <SoftCard variant="default">
                  <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground">{group.name}</h3>
                      {group.description && (
                        <p className="text-muted-foreground text-sm mt-1">{group.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <SoftButton
                        variant="secondary"
                        onClick={() => handleEditClick(group)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </SoftButton>
                      <SoftButton
                        variant="danger"
                        onClick={() => setDeleteConfirm(group.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </SoftButton>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 pb-6 border-b border-border/40">
                    <div>
                      <p className="text-muted-foreground text-sm">Members</p>
                      <p className="text-2xl font-bold text-primary">{group.memberCount}</p>
                    </div>
                    {group.welcomeMessageEnabled && (
                      <div>
                        <p className="text-muted-foreground text-sm">Welcome Message</p>
                        <p className="text-sm text-green-400 font-medium">Enabled</p>
                      </div>
                    )}
                  </div>

                  <SoftButton
                    variant="secondary"
                    onClick={() => window.location.href = `/members?groupId=${group.id}`}
                    fullWidth
                  >
                    Manage Members
                  </SoftButton>
                </SoftCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <SoftCard className="max-w-sm w-full">
              <div className="flex gap-3 items-start mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Delete Group?</h3>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                This will delete the group and remove all members. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <SoftButton
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                  fullWidth
                >
                  Cancel
                </SoftButton>
                <SoftButton
                  variant="danger"
                  onClick={() => handleDeleteClick(deleteConfirm)}
                  fullWidth
                >
                  Delete
                </SoftButton>
              </div>
            </SoftCard>
          </motion.div>
        </div>
      )}

      {/* Modal */}
      <GroupFormModal
        isOpen={isModalOpen}
        group={editingGroup}
        branchId={branchId}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGroup(undefined);
        }}
        onSuccess={handleModalSuccess}
      />
    </SoftLayout>
  );
}

export default GroupsPage;

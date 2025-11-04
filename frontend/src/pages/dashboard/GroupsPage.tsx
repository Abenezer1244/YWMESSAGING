import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useGroupStore, { Group } from '../../stores/groupStore';
import { getGroups, deleteGroup } from '../../api/groups';
import { GroupFormModal } from '../../components/groups/GroupFormModal';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui';

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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Spinner size="lg" text="Loading groups..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton variant="ghost" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">👥 Groups</h1>
            <p className="text-foreground/80">{groups.length} groups in this branch</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreateClick}
          >
            + New Group
          </Button>
        </div>

        {/* Main Content */}
        {groups.length === 0 ? (
          <Card variant="highlight" className="text-center py-16 bg-muted border-border">
            <div className="mb-6">
              <span className="text-6xl">👥</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              No Groups Yet
            </h2>
            <p className="text-foreground/80 mb-6 max-w-md mx-auto">
              Create your first group to start organizing your congregation.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={handleCreateClick}
            >
              Create First Group
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Card key={group.id} variant="default" className="hover:shadow-lg transition-shadow bg-muted border-border">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{group.name}</h3>
                    {group.description && (
                      <p className="text-foreground/80 text-sm mt-1">{group.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditClick(group)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteConfirm(group.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-6 pb-6 border-b border-border">
                  <div>
                    <p className="text-muted-foreground text-sm">👤 Members</p>
                    <p className="text-2xl font-bold text-primary">{group.memberCount}</p>
                  </div>
                  {group.welcomeMessageEnabled && (
                    <div>
                      <p className="text-muted-foreground text-sm">Welcome Message</p>
                      <p className="text-sm text-green-400 font-medium">✅ Enabled</p>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = `/members?groupId=${group.id}`}
                  fullWidth
                >
                  👥 Manage Members
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="default" className="max-w-sm w-full bg-muted border-border">
            <h3 className="text-lg font-bold text-foreground mb-2">⚠️ Delete Group?</h3>
            <p className="text-foreground/80 mb-6">
              This will delete the group and remove all members. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDeleteConfirm(null)}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => handleDeleteClick(deleteConfirm)}
                fullWidth
              >
                Delete
              </Button>
            </div>
          </Card>
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
    </div>
  );
}

export default GroupsPage;

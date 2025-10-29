import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useGroupStore, { Group } from '../../stores/groupStore';
import { getGroups, deleteGroup } from '../../api/groups';
import { GroupFormModal } from '../../components/groups/GroupFormModal';

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
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
              <p className="text-gray-600 mt-1">{groups.length} groups</p>
            </div>
            <button
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              + Create Group
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No groups yet</p>
            <button
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Create First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    {group.description && (
                      <p className="text-gray-600 text-sm mt-1">{group.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(group)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(group.id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-gray-600 text-sm">Members</p>
                    <p className="text-2xl font-bold text-blue-600">{group.memberCount}</p>
                  </div>
                  {group.welcomeMessageEnabled && (
                    <div>
                      <p className="text-gray-600 text-sm">Welcome Message</p>
                      <p className="text-sm text-green-600 font-medium">✓ Enabled</p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <a
                    href={`/members?groupId=${group.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Manage Members →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Group?</h3>
            <p className="text-gray-600 mb-6">
              This will delete the group and remove all members. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteClick(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
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

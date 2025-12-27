import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Trash2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { useBranchStore } from '../../stores/branchStore';
import { useGroupStore } from '../../stores/groupStore';
import { getMembers, Member, removeMember } from '../../api/members';
import { getBranches } from '../../api/branches';
import { getGroups } from '../../api/groups';
import { AddMemberModal } from '../../components/members/AddMemberModal';
import { ImportCSVModal } from '../../components/members/ImportCSVModal';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
import Input from '../../components/ui/Input';
import { Spinner } from '../../components/ui';
import { MobileTable, Column } from '../../components/responsive';
import { designTokens } from '../../utils/designTokens';

export function MembersPage() {
  const auth = useAuthStore();
  const { branches } = useBranchStore();
  const { groups, setGroups } = useGroupStore();
  const [searchParams] = useSearchParams();
  const { groupId: urlGroupId } = useParams<{ groupId?: string }>();
  const [isInitialLoading, setIsInitialLoading] = useState(!groups.length);

  let groupId = urlGroupId || searchParams.get('groupId') || groups[0]?.id || '';

  // ✅ FIX: Ensure search params are always prioritized over fallback
  // This prevents the Members page from always showing the first group
  // when navigating via ?groupId=xxx query parameter
  const queryGroupId = searchParams.get('groupId');
  if (queryGroupId) {
    groupId = queryGroupId;
  }

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const limit = 50;
  const pages = Math.ceil(total / limit);
  const currentGroup = groups.find((g) => g.id === groupId);

  // Define loadMembers function first (must be before useEffect hooks)
  // CRITICAL: Only update total on first load (page=1) or search, NOT on every page navigation
  const loadMembers = useCallback(async (pageNum: number = 1, updateTotal: boolean = true) => {
    if (!groupId) return;

    try {
      setIsLoading(true);
      const data = await getMembers(groupId, {
        page: pageNum,
        limit,
        search: search || undefined,
      });
      setMembers(data.data);

      // CRITICAL FIX: Only update total count when explicitly requested
      // This prevents pagination from showing changing "X of Y" as data modifies
      // Total is updated only on:
      // 1. Initial load (page 1)
      // 2. After search
      // 3. After add/import/delete (explicit calls)
      // NOT on page navigation
      if (updateTotal) {
        setTotal(data.pagination.total);
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  }, [groupId, search]);

  // Load branches and groups on mount if not already loaded
  useEffect(() => {
    if (!groups.length && auth.church?.id && branches.length > 0) {
      const loadGroupsForFirstBranch = async () => {
        try {
          const firstBranch = branches[0];
          const branchGroups = await getGroups(firstBranch.id);
          setGroups(branchGroups);
        } catch (error) {
          console.error('Failed to load groups:', error);
        } finally {
          setIsInitialLoading(false);
        }
      };
      loadGroupsForFirstBranch();
    } else {
      setIsInitialLoading(false);
    }
  }, [auth.church?.id, branches, groups.length, setGroups]);

  // Load members when group changes (initial load) - UPDATE TOTAL
  useEffect(() => {
    if (groupId) {
      loadMembers(1, true);  // true = update total
    }
  }, [groupId, loadMembers]);

  // Load members when page changes (pagination) - DON'T UPDATE TOTAL
  // This keeps pagination stable and prevents "X of Y" from changing
  useEffect(() => {
    if (groupId && page > 1) {
      loadMembers(page, false);  // false = don't update total
    }
  }, [page, groupId, loadMembers]);

  // Debounce search - wait 500ms after user stops typing before searching
  useEffect(() => {
    if (!groupId) return;

    const searchTimer = setTimeout(() => {
      // Reset to page 1 when searching
      setPage(1);
      loadMembers(1, true);  // true = update total for new search results
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [search, groupId, loadMembers]);

  const handleAddSuccess = async (newMember: Member) => {
    // Refetch members list after successful add
    // Reset to page 1 and load fresh data
    setPage(1);
    // Wait for backend cache invalidation and ensure data is fresh
    // Redis cache invalidation takes ~50ms, API call ~200ms, so wait longer to be safe
    await new Promise(resolve => setTimeout(resolve, 800));
    await loadMembers(1, true);  // true = update total
    setIsAddModalOpen(false);
  };

  const handleImportSuccess = async () => {
    setPage(1);
    // Wait for backend cache invalidation and ensure data is fresh
    // Bulk import may take longer, so wait 1.5s to be safe
    await new Promise(resolve => setTimeout(resolve, 1500));
    await loadMembers(1, true);  // true = update total
    setIsImportModalOpen(false);
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this group?`)) {
      return;
    }

    try {
      setDeletingMemberId(memberId);
      await removeMember(groupId, memberId);
      toast.success('Member removed successfully');
      // CRITICAL FIX: Refresh the member list from backend to ensure deletion is reflected
      // Don't rely on optimistic updates that can fail silently
      // Reset to page 1 and reload with updated count
      setPage(1);
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadMembers(1, true);  // true = update total count
    } catch (error) {
      toast.error((error as Error).message || 'Failed to remove member');
    } finally {
      setDeletingMemberId(null);
    }
  };

  // Show loading spinner while initially loading groups
  if (isInitialLoading) {
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

  // Show error if no group selected and no groupId in URL
  if (!groupId) {
    return (
      <SoftLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <SoftCard className="text-center max-w-md">
            <p className="text-foreground/80 text-lg">
              No group selected. Create or select a group first.
            </p>
          </SoftCard>
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
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Members</span>
              </h1>
              <p className="text-muted-foreground">
                {currentGroup?.name || 'Group'} • {total} members
              </p>
            </div>
            <SoftButton
              variant="primary"
              size="lg"
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Member
            </SoftButton>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <Input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 min-w-xs"
            />
            <SoftButton
              variant="secondary"
              size="md"
              onClick={() => setIsImportModalOpen(true)}
            >
              Import CSV
            </SoftButton>
          </div>
        </motion.div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <Loader className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        ) : members.length === 0 ? (
          <SoftCard className="text-center py-16">
            <div className="mb-6">
              <Users className="w-16 h-16 text-muted-foreground/50 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {search ? 'No Results' : 'No Members Yet'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {search ? 'No members found matching your search' : 'Add your first member to get started'}
            </p>
            {!search && (
              <SoftButton
                variant="primary"
                onClick={() => setIsAddModalOpen(true)}
              >
                Add First Member
              </SoftButton>
            )}
          </SoftCard>
        ) : (
          <>
            {/* Table - Responsive */}
            <SoftCard variant="default" className="overflow-hidden">
              <MobileTable
                data={members}
                columns={[
                  {
                    label: 'Name',
                    key: 'firstName',
                    render: (member) => `${member.firstName} ${member.lastName}`,
                  },
                  {
                    label: 'Phone',
                    key: 'phone',
                  },
                  {
                    label: 'Email',
                    key: 'email',
                    hideOnMobile: false,
                  },
                  {
                    label: 'Status',
                    key: 'optInSms',
                    render: (member) => (
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-lg ${
                          member.optInSms
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {member.optInSms ? 'Opted In' : 'Opted Out'}
                      </span>
                    ),
                  },
                  {
                    label: 'Added',
                    key: 'createdAt',
                    render: (member) => new Date(member.createdAt).toLocaleDateString(),
                  },
                ] as Column<Member>[]}
                keyField="id"
                renderActions={(member) => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() =>
                      handleDeleteMember(member.id, `${member.firstName} ${member.lastName}`)
                    }
                    disabled={deletingMemberId === member.id}
                    style={{
                      minHeight: designTokens.touchTarget.enhanced,
                      minWidth: designTokens.touchTarget.enhanced,
                    }}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deletingMemberId === member.id ? 'Removing...' : 'Remove'}
                  </motion.button>
                )}
              />
            </SoftCard>

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-8 flex justify-center gap-2 items-center">
                <SoftButton
                  variant="secondary"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </SoftButton>
                <div className="px-4 py-2 text-muted-foreground font-medium">
                  Page {page} of {pages}
                </div>
                <SoftButton
                  variant="secondary"
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  disabled={page === pages}
                >
                  Next
                </SoftButton>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        groupId={groupId}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <ImportCSVModal
        isOpen={isImportModalOpen}
        groupId={groupId}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </SoftLayout>
  );
}

export default MembersPage;

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useGroupStore from '../../stores/groupStore';
import { getMembers, Member } from '../../api/members';
import { AddMemberModal } from '../../components/members/AddMemberModal';
import { ImportCSVModal } from '../../components/members/ImportCSVModal';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { Spinner } from '../../components/ui';

export function MembersPage() {
  const { groups, setLoading: setGroupsLoading } = useGroupStore();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId') || groups[0]?.id || '';

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const limit = 50;
  const pages = Math.ceil(total / limit);
  const currentGroup = groups.find((g) => g.id === groupId);

  // Debounce search - wait 500ms after user stops typing before searching
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      loadMembers();
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [groupId, page, search]);

  const loadMembers = async () => {
    if (!groupId) return;

    try {
      setIsLoading(true);
      const data = await getMembers(groupId, {
        page,
        limit,
        search: search || undefined,
      });
      setMembers(data.data);
      setTotal(data.pagination.total);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuccess = (newMember: Member) => {
    setMembers([newMember, ...members]);
    setTotal(total + 1);
    setIsAddModalOpen(false);
  };

  const handleImportSuccess = () => {
    setPage(1);
    loadMembers();
    setIsImportModalOpen(false);
  };

  if (!currentGroup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card variant="default" className="text-center max-w-md bg-muted border-border">
          <p className="text-foreground/80 text-lg">
            No group selected. Create or select a group first.
          </p>
        </Card>
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">👤 Members</h1>
              <p className="text-foreground/80">
                {currentGroup.name} • {total} members
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsAddModalOpen(true)}
            >
              + Add Member
            </Button>
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
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsImportModalOpen(true)}
            >
              📥 Import CSV
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" text="Loading members..." />
          </div>
        ) : members.length === 0 ? (
          <Card variant="highlight" className="text-center py-16 bg-muted border-border">
            <div className="mb-6">
              <span className="text-6xl">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {search ? 'No Results' : 'No Members Yet'}
            </h2>
            <p className="text-foreground/80 mb-6 max-w-md mx-auto">
              {search ? 'No members found matching your search' : 'Add your first member to get started'}
            </p>
            {!search && (
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddModalOpen(true)}
              >
                Add First Member
              </Button>
            )}
          </Card>
        ) : (
          <>
            {/* Table */}
            <Card variant="default" className="overflow-hidden bg-muted border-border">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-card border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Added
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-muted/50 transition-colors duration-normal">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">
                            {member.firstName} {member.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground/80">{member.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground/80">
                            {member.email || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              member.optInSms
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {member.optInSms ? '✅ Opted In' : '❌ Opted Out'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  ← Previous
                </Button>
                <div className="px-4 py-2 text-foreground/80 font-medium">
                  Page {page} of {pages}
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  disabled={page === pages}
                >
                  Next →
                </Button>
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
    </div>
  );
}

export default MembersPage;

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clubCottonwoodApi } from './api/clubCottonwood';
import type { ClubMember, MembershipStatus } from './types/clubCottonwood';
import StatsCards from './components/StatsCards';
import RenewalForecast from './components/RenewalForecast';
import MemberTable from './components/MemberTable';
import MemberDetails from './components/MemberDetails';
import EmailComposer from './components/EmailComposer';
import SyncStatus from './components/SyncStatus';

type TabId = 'all' | 'active' | 'overdue' | 'prospects';

export default function ClubCottonwood() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [searchInput, setSearchInput] = useState(''); // Immediate input value
  const [searchQuery, setSearchQuery] = useState(''); // Debounced value for API
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Map tab to status filter
  const statusFilter: MembershipStatus | undefined = {
    all: undefined,
    active: 'Active',
    overdue: 'Overdue',
    prospects: 'Prospect',
  }[activeTab] as MembershipStatus | undefined;

  // For "all" tab, filter to only Quack-tagged members (not prospects)
  const hasQuackTagFilter = activeTab === 'all' ? true : undefined;

  // Fetch stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['club-cottonwood', 'stats'],
    queryFn: () => clubCottonwoodApi.getStats(),
  });

  // Fetch members
  const { data: membersData, isLoading: loadingMembers } = useQuery({
    queryKey: ['club-cottonwood', 'members', statusFilter, hasQuackTagFilter, searchQuery, page],
    queryFn: () => clubCottonwoodApi.getMembers({
      status: statusFilter,
      hasQuackTag: hasQuackTagFilter,
      search: searchQuery || undefined,
      page,
      pageSize,
    }),
  });

  // Track if current sync is a full sync
  const [isFullSync, setIsFullSync] = useState(false);

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: (full: boolean = false) => {
      setIsFullSync(full);
      return clubCottonwoodApi.sync(full);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-cottonwood'] });
    },
  });

  // "All Members" count = active + overdue (only Quack-tagged, not prospects) - v2
  const allMembersCount = (stats?.activeMembers ?? 0) + (stats?.overdueMembers ?? 0);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'all', label: 'All Members', count: allMembersCount },
    { id: 'active', label: 'Active', count: stats?.activeMembers },
    { id: 'overdue', label: 'Overdue', count: stats?.overdueMembers },
    { id: 'prospects', label: 'Prospects', count: stats?.prospectCount },
  ];

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setPage(1);
    setSelectedMembers([]);
    setSearchInput('');
    setSearchQuery('');
  };

  const handleMemberSelect = (memberId: string, selected: boolean) => {
    if (selected) {
      setSelectedMembers([...selectedMembers, memberId]);
    } else {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && membersData?.members) {
      setSelectedMembers(membersData.members.map((m) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleMemberClick = (member: ClubMember) => {
    setSelectedMember(member);
  };

  const handleMemberUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['club-cottonwood'] });
    setSelectedMember(null);
  };

  const handleEmailSent = () => {
    setShowEmailComposer(false);
    setSelectedMembers([]);
  };

  const isLoading = loadingStats || loadingMembers;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#202223] mb-1">
            Club Cottonwood
          </h1>
          <p className="text-sm text-[#6d7175]">
            Manage annual membership and member outreach
          </p>
        </div>
        <SyncStatus
          lastSyncAt={stats?.lastSyncAt}
          onSync={(full) => syncMutation.mutate(full ?? false)}
          isSyncing={syncMutation.isPending}
          syncResult={syncMutation.data}
          syncError={syncMutation.error?.message}
          isFullSync={isFullSync}
        />
      </div>

      {isLoading && !membersData ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-[#6d7175]">Loading...</div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Renewal Forecast */}
          <RenewalForecast />

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[#f6f6f7] p-1 rounded-lg w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-[#202223] shadow-sm'
                    : 'text-[#6d7175] hover:text-[#202223]'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 text-xs opacity-75">({tab.count})</span>
                )}
              </button>
            ))}
          </div>

          {/* Search and Actions Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5CB3E5] focus:border-[#5CB3E5]"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7175]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {selectedMembers.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#6d7175]">
                  {selectedMembers.length} selected
                </span>
                <button
                  onClick={() => setShowEmailComposer(true)}
                  className="px-4 py-2 bg-[#5CB3E5] text-white rounded-lg text-sm font-medium hover:bg-[#45A5DB] transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </button>
                <button
                  onClick={() => setSelectedMembers([])}
                  className="text-sm text-[#6d7175] hover:text-[#202223]"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>

          {/* Member Table */}
          <MemberTable
            members={membersData?.members || []}
            selectedMembers={selectedMembers}
            onMemberSelect={handleMemberSelect}
            onSelectAll={handleSelectAll}
            onMemberClick={handleMemberClick}
            isLoading={loadingMembers}
          />

          {/* Pagination */}
          {membersData && membersData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-[#6d7175]">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, membersData.totalCount)} of{' '}
                {membersData.totalCount} members
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-[#e1e3e5] rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f6f6f7]"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= membersData.totalPages}
                  className="px-3 py-1 border border-[#e1e3e5] rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f6f6f7]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberDetails
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdate={handleMemberUpdate}
        />
      )}

      {/* Email Composer Modal */}
      {showEmailComposer && (
        <EmailComposer
          memberIds={selectedMembers}
          memberCount={selectedMembers.length}
          onClose={() => setShowEmailComposer(false)}
          onSent={handleEmailSent}
        />
      )}
    </div>
  );
}

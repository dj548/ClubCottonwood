import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clubCottonwoodApi } from './api/clubCottonwood';
import type { ClubMember, MembershipStatus } from './types/clubCottonwood';
import { format } from 'date-fns';
import StatsCards from './components/StatsCards';
import RenewalForecast from './components/RenewalForecast';
import MemberTable from './components/MemberTable';
import MemberDetails from './components/MemberDetails';
import EmailComposer from './components/EmailComposer';
import SyncStatus from './components/SyncStatus';
import ActivityLog from './components/ActivityLog';

type TabId = 'all' | 'active' | 'overdue' | 'prospects';
type ViewMode = 'members' | 'activity';

export default function ClubCottonwood() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('members');
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

  // Bulk remove tag mutations
  const [showBulkConfirm, setShowBulkConfirm] = useState<'selected' | 'overdue' | null>(null);
  const [bulkResult, setBulkResult] = useState<{ removedCount: number; failedCount: number; memberNames?: string[] } | null>(null);

  const bulkRemoveTagMutation = useMutation({
    mutationFn: (memberIds: string[]) => clubCottonwoodApi.bulkRemoveTag(memberIds),
    onSuccess: (data) => {
      setBulkResult(data);
      setShowBulkConfirm(null);
      setSelectedMembers([]);
      queryClient.invalidateQueries({ queryKey: ['club-cottonwood'] });
    },
  });

  const bulkRemoveTagOverdueMutation = useMutation({
    mutationFn: () => clubCottonwoodApi.bulkRemoveTagOverdue(),
    onSuccess: (data) => {
      setBulkResult(data);
      setShowBulkConfirm(null);
      queryClient.invalidateQueries({ queryKey: ['club-cottonwood'] });
    },
  });

  // Test email - sends via existing email endpoint
  const testEmailMutation = useMutation({
    mutationFn: async () => {
      // Find Dan's member ID from the current data, or send directly
      const allMembers = await clubCottonwoodApi.getMembers({ search: 'dj@cottonwoodinthepark.com', pageSize: 1 });
      if (allMembers.members.length === 0) throw new Error('Member not found');
      const member = allMembers.members[0];
      return clubCottonwoodApi.sendEmail({
        memberIds: [member.id],
        subject: 'Your Club Cottonwood membership expires today',
        htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #202223;">Hi Dan,</h2>
    <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Thank you so much for being a Club Cottonwood member this past year! We've truly loved having you
        as part of our community and hope you've enjoyed the perks and discounts that come with membership.
    </p>
    <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Your membership expires today, and we'd love to have you back for another year. Renewing is easy —
        just click the link below to purchase your membership online:
    </p>
    <p style="text-align: center; margin: 24px 0;">
        <a href="https://cottonwoodinthepark.com/products/club-cottonwood"
           style="display: inline-block; padding: 14px 28px; background-color: #5CB3E5; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Renew My Membership
        </a>
    </p>
    <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Upon purchase, don't forget to visit the store to pick up your free membership gift!
    </p>
    <p style="color: #333; font-size: 16px; line-height: 1.6;">
        If you have any questions, feel free to reply to this email or stop by the shop. We hope to see you soon!
    </p>
    <p style="color: #6d7175; font-size: 14px; margin-top: 24px;">
        With gratitude,<br/>
        — The Cottonwood Team
    </p>
</div>`,
      });
    },
  });

  // CSV Export
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await clubCottonwoodApi.getMembers({
        status: statusFilter,
        hasQuackTag: hasQuackTagFilter,
        search: searchQuery || undefined,
        page: 1,
        pageSize: 99999,
      });

      const headers = ['Name', 'Email', 'Phone', 'Status', 'Quack Tag', 'Renewal Date', 'Days Until Renewal', 'Last Order'];
      const rows = data.members.map((m: ClubMember) => [
        m.name,
        m.email,
        m.phone || '',
        m.status,
        m.hasQuackTag ? 'Yes' : 'No',
        m.effectiveRenewalDueDate ? format(new Date(m.effectiveRenewalDueDate), 'yyyy-MM-dd') : '',
        m.daysUntilRenewal?.toString() || '',
        m.lastOrderNumber || '',
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `club-cottonwood-${activeTab}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [statusFilter, hasQuackTagFilter, searchQuery, activeTab]);

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => testEmailMutation.mutate()}
            disabled={testEmailMutation.isPending}
            className="px-3 py-2 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {testEmailMutation.isPending ? 'Sending...' : testEmailMutation.isSuccess ? 'Sent!' : 'Test Expiry Email'}
          </button>
          <SyncStatus
            lastSyncAt={stats?.lastSyncAt}
            onSync={(full) => syncMutation.mutate(full ?? false)}
            isSyncing={syncMutation.isPending}
            syncResult={syncMutation.data}
            syncError={syncMutation.error?.message}
            isFullSync={isFullSync}
          />
        </div>
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

          {/* View Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setViewMode('members')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'members'
                  ? 'bg-[#5CB3E5] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Members
              </span>
            </button>
            <button
              onClick={() => setViewMode('activity')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'activity'
                  ? 'bg-[#5CB3E5] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Activity Log
              </span>
            </button>
          </div>

          {viewMode === 'activity' ? (
            <ActivityLog />
          ) : (
            <>
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
            <div className="flex items-center gap-3">
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
              <button
                onClick={handleExportCsv}
                disabled={isExporting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {activeTab === 'overdue' && (
                <button
                  onClick={() => setShowBulkConfirm('overdue')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Tag for 30+ Days Overdue
                </button>
              )}

              {selectedMembers.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#6d7175]">
                    {selectedMembers.length} selected
                  </span>
                  <button
                    onClick={() => setShowBulkConfirm('selected')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Remove Tag for Selected
                  </button>
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

      {/* Bulk Remove Tag Confirmation */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setShowBulkConfirm(null)}>
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Tag Removal</h3>
            <p className="text-sm text-gray-600 mb-4">
              {showBulkConfirm === 'selected'
                ? `Remove the Quack tag from ${selectedMembers.length} selected member${selectedMembers.length === 1 ? '' : 's'}? This will update their status in Shopify.`
                : 'Remove the Quack tag from all members who are 30+ days overdue? This will update their status in Shopify.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showBulkConfirm === 'selected') {
                    bulkRemoveTagMutation.mutate(selectedMembers);
                  } else {
                    bulkRemoveTagOverdueMutation.mutate();
                  }
                }}
                disabled={bulkRemoveTagMutation.isPending || bulkRemoveTagOverdueMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {bulkRemoveTagMutation.isPending || bulkRemoveTagOverdueMutation.isPending
                  ? 'Removing...'
                  : 'Remove Tags'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Result Modal */}
      {bulkResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setBulkResult(null)}>
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tag Removal Complete</h3>
            <div className="text-sm text-gray-600 mb-4">
              <p>Successfully removed: <span className="font-medium text-green-600">{bulkResult.removedCount}</span></p>
              {bulkResult.failedCount > 0 && (
                <p>Failed: <span className="font-medium text-red-600">{bulkResult.failedCount}</span></p>
              )}
              {bulkResult.memberNames && bulkResult.memberNames.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-gray-700 mb-1">Members affected:</p>
                  <ul className="list-disc list-inside text-xs text-gray-500 max-h-32 overflow-y-auto">
                    {bulkResult.memberNames.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setBulkResult(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#5CB3E5] rounded-lg hover:bg-[#45A5DB]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

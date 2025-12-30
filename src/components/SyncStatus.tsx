import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import type { SyncResponse } from '../types/clubCottonwood';

interface SyncStatusProps {
  lastSyncAt?: string;
  onSync: (full?: boolean) => void;
  isSyncing: boolean;
  syncResult?: SyncResponse;
  syncError?: string;
  isFullSync?: boolean;
}

export default function SyncStatus({ lastSyncAt, onSync, isSyncing, syncResult, syncError, isFullSync }: SyncStatusProps) {
  const [showResult, setShowResult] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Show result notification when sync completes
  useEffect(() => {
    if (syncResult || syncError) {
      setShowResult(true);
      const timer = setTimeout(() => setShowResult(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [syncResult, syncError]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xs text-[#6d7175] uppercase tracking-wider">Last Synced</div>
          <div className="text-sm text-[#202223]">
            {lastSyncAt
              ? formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true })
              : 'Never'}
          </div>
        </div>
        <div className="relative">
          <div className="flex">
            <button
              onClick={() => onSync(false)}
              disabled={isSyncing}
              className="px-4 py-2 rounded-l-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white shadow-md hover:shadow-lg"
              style={{
                background: isSyncing
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #6FA7CE 0%, #8EBC67 100%)'
              }}
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isFullSync ? 'Full Sync...' : 'Syncing...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync
                </>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              disabled={isSyncing}
              className="px-2 py-2 rounded-r-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md hover:shadow-lg border-l border-white/20"
              style={{
                background: isSyncing
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #6FA7CE 0%, #8EBC67 100%)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showMenu && !isSyncing && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-[#e1e3e5] py-1 z-10">
              <button
                onClick={() => {
                  onSync(false);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[#f6f6f7] flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-[#6d7175]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div>
                  <div className="font-medium text-[#202223]">Quick Sync</div>
                  <div className="text-xs text-[#6d7175]">New orders since last sync</div>
                </div>
              </button>
              <button
                onClick={() => {
                  onSync(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[#f6f6f7] flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-[#6d7175]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <div>
                  <div className="font-medium text-[#202223]">Full Sync</div>
                  <div className="text-xs text-[#6d7175]">Re-fetch all customers & orders</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress/Status Messages */}
      {isSyncing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700 flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Fetching customers with Quack tag and Club Cottonwood orders via GraphQL...</span>
        </div>
      )}

      {/* Success Message */}
      {showResult && syncResult && !syncError && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>
            Sync complete: {syncResult.newMembers} new, {syncResult.updatedMembers} updated
            {syncResult.totalOrders !== undefined && ` (${syncResult.totalOrders} orders found)`}
          </span>
        </div>
      )}

      {/* Error Message */}
      {showResult && syncError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Sync failed: {syncError}</span>
        </div>
      )}
    </div>
  );
}

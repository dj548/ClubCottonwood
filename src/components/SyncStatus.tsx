import { formatDistanceToNow } from 'date-fns';

interface SyncStatusProps {
  lastSyncAt?: string;
  onSync: () => void;
  isSyncing: boolean;
}

export default function SyncStatus({ lastSyncAt, onSync, isSyncing }: SyncStatusProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="text-xs text-[#6d7175] uppercase tracking-wider">Last Synced</div>
        <div className="text-sm text-[#202223]">
          {lastSyncAt
            ? formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true })
            : 'Never'}
        </div>
      </div>
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="px-4 py-2 bg-white border border-[#e1e3e5] rounded-lg text-sm font-medium text-[#202223] hover:bg-[#f6f6f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSyncing ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Syncing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync from Shopify
          </>
        )}
      </button>
    </div>
  );
}

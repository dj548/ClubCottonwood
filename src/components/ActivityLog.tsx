import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clubCottonwoodApi } from '../api/clubCottonwood';

type ActivityType = 'all' | 'email_sent' | 'tag_added' | 'tag_removed';

const activityTypeLabels: Record<string, string> = {
  email_sent: 'Email Sent',
  tag_added: 'Tag Added',
  tag_removed: 'Tag Removed',
};

const activityTypeColors: Record<string, string> = {
  email_sent: 'bg-blue-100 text-blue-800',
  tag_added: 'bg-green-100 text-green-800',
  tag_removed: 'bg-red-100 text-red-800',
};

export default function ActivityLog() {
  const [filter, setFilter] = useState<ActivityType>('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['club-cottonwood', 'activity-logs', filter],
    queryFn: () => clubCottonwoodApi.getActivityLogs(100, filter === 'all' ? undefined : filter),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const filters: { id: ActivityType; label: string }[] = [
    { id: 'all', label: 'All Activity' },
    { id: 'email_sent', label: 'Emails' },
    { id: 'tag_added', label: 'Tags Added' },
    { id: 'tag_removed', label: 'Tags Removed' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading activity...</div>
      ) : !logs || logs.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No activity recorded yet</p>
          <p className="text-sm mt-1">Email sends and tag changes will appear here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  log.activityType === 'email_sent' ? 'bg-blue-100' :
                  log.activityType === 'tag_added' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {log.activityType === 'email_sent' ? (
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ) : log.activityType === 'tag_added' ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      activityTypeColors[log.activityType] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {activityTypeLabels[log.activityType] || log.activityType}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-900">{log.description}</p>
                  {log.memberName && (
                    <p className="mt-0.5 text-sm text-gray-500">
                      {log.memberName} ({log.memberEmail})
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

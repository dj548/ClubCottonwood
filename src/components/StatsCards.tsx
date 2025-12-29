import type { ClubStats } from '../types/clubCottonwood';

interface StatsCardsProps {
  stats?: ClubStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        className="cw-stat-card"
        style={{ backgroundImage: 'linear-gradient(to bottom right, #A8D35F, #95C04A)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-medium opacity-90">Active Members</div>
          <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-3xl font-bold mb-0.5">{stats?.activeMembers ?? 0}</div>
        <div className="text-xs opacity-75">current members</div>
      </div>

      <div
        className="cw-stat-card"
        style={{ backgroundImage: 'linear-gradient(to bottom right, #FF8B5A, #FF7543)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-medium opacity-90">Overdue</div>
          <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-3xl font-bold mb-0.5">{stats?.overdueMembers ?? 0}</div>
        <div className="text-xs opacity-75">need renewal</div>
      </div>

      <div
        className="cw-stat-card"
        style={{ backgroundImage: 'linear-gradient(to bottom right, #5CB3E5, #45A5DB)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-medium opacity-90">Prospects</div>
          <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <div className="text-3xl font-bold mb-0.5">{stats?.prospectCount ?? 0}</div>
        <div className="text-xs opacity-75">never joined</div>
      </div>

      <div
        className="cw-stat-card"
        style={{ backgroundImage: 'linear-gradient(to bottom right, #9B7DDB, #8B6DCB)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-medium opacity-90">Expiring Soon</div>
          <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="text-3xl font-bold mb-0.5">{stats?.expiringThisMonth ?? 0}</div>
        <div className="text-xs opacity-75">this month</div>
      </div>
    </div>
  );
}

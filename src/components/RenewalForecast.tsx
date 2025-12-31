import { useQuery } from '@tanstack/react-query';
import { clubCottonwoodApi } from '../api/clubCottonwood';

export default function RenewalForecast() {
  const { data: forecast, isLoading } = useQuery({
    queryKey: ['club-cottonwood', 'renewal-forecast'],
    queryFn: () => clubCottonwoodApi.getRenewalForecast(),
  });

  if (isLoading || !forecast) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="text-gray-500">Loading forecast...</div>
      </div>
    );
  }

  const maxTotal = Math.max(...forecast.map(f => f.total), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Renewal Forecast
      </h3>

      <div className="h-48 flex items-end gap-1.5">
        {forecast.map((item) => {
          // Calculate bar height as percentage of max (for the total bar height)
          const barHeightPercent = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
          // Calculate portions within the bar
          const renewedPortion = item.total > 0 ? (item.renewed / item.total) * 100 : 0;
          const outstandingPortion = item.total > 0 ? (item.outstanding / item.total) * 100 : 0;

          return (
            <div
              key={item.month}
              className="flex-1 flex flex-col items-center gap-1"
            >
              {/* Bar container */}
              <div className="w-full flex flex-col items-center justify-end h-36">
                {item.total > 0 && (
                  <span className="text-xs text-gray-600 mb-1">{item.total}</span>
                )}
                {/* Stacked bar - height based on total, internally split by renewed/outstanding */}
                <div
                  className="w-full flex flex-col-reverse rounded-t overflow-hidden"
                  style={{
                    height: item.total > 0 ? `${Math.max(barHeightPercent, 5)}%` : '2px',
                    minHeight: item.total > 0 ? '8px' : '2px'
                  }}
                >
                  {/* Renewed portion (bottom - green) */}
                  {item.renewed > 0 && (
                    <div
                      className="w-full transition-all"
                      style={{
                        height: `${renewedPortion}%`,
                        backgroundColor: '#22c55e', // green-500
                        minHeight: '4px',
                      }}
                      title={`${item.renewed} renewed`}
                    />
                  )}
                  {/* Outstanding portion (top - varies by time) */}
                  {item.outstanding > 0 && (
                    <div
                      className="w-full transition-all"
                      style={{
                        height: `${outstandingPortion}%`,
                        backgroundColor: item.isPast
                          ? '#ef4444' // red for past due
                          : item.isCurrent
                            ? '#f59e0b' // amber for current month
                            : '#e5e7eb', // gray for future
                        minHeight: '4px',
                      }}
                      title={`${item.outstanding} outstanding`}
                    />
                  )}
                  {/* Empty bar placeholder */}
                  {item.total === 0 && (
                    <div
                      className="w-full bg-gray-100"
                      style={{ height: '100%' }}
                    />
                  )}
                </div>
              </div>

              {/* Month label */}
              <span className={`text-xs ${
                item.isCurrent
                  ? 'font-semibold text-gray-900'
                  : item.isPast
                    ? 'text-gray-400'
                    : 'text-gray-500'
              }`}>
                {item.monthShort}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span>Renewed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span>Past Due</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-500" />
          <span>Due This Month</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-200" />
          <span>Upcoming</span>
        </div>
      </div>
    </div>
  );
}

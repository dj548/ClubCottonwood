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

  const maxRenewals = Math.max(...forecast.map(f => f.renewals), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Renewal Forecast (Next 12 Months)
      </h3>

      <div className="h-40 flex items-end gap-2">
        {forecast.map((item, index) => {
          const height = maxRenewals > 0 ? (item.renewals / maxRenewals) * 100 : 0;
          const isCurrentMonth = index === 0;

          return (
            <div
              key={item.month}
              className="flex-1 flex flex-col items-center gap-1"
            >
              {/* Bar */}
              <div className="w-full flex flex-col items-center justify-end h-28">
                {item.renewals > 0 && (
                  <span className="text-xs text-gray-600 mb-1">{item.renewals}</span>
                )}
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${Math.max(height, 4)}%`,
                    background: isCurrentMonth
                      ? 'linear-gradient(135deg, #6FA7CE 0%, #8EBC67 100%)'
                      : '#e5e7eb',
                    minHeight: item.renewals > 0 ? '8px' : '2px',
                  }}
                />
              </div>

              {/* Month label */}
              <span className={`text-xs ${isCurrentMonth ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                {item.monthShort}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Expected renewals based on membership due dates
      </div>
    </div>
  );
}

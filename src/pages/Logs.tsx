import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  details?: string;
}

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch logs from API
  const { data: apiLogs, isLoading, error, refetch } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/club-cottonwood/logs');
      return response.data as LogEntry[];
    },
    refetchInterval: autoRefresh ? 5000 : false,
    retry: 1,
  });

  // Add client-side logs
  const addLog = (level: LogEntry['level'], message: string, details?: string) => {
    setLogs(prev => [{
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    }, ...prev].slice(0, 500)); // Keep last 500 logs
  };

  // Log API errors
  useEffect(() => {
    if (error) {
      addLog('error', 'Failed to fetch logs from API', (error as Error).message);
    }
  }, [error]);

  // Log API success
  useEffect(() => {
    if (apiLogs) {
      addLog('info', `Loaded ${apiLogs.length} logs from server`);
    }
  }, [apiLogs?.length]);

  // Combine API logs with client logs
  const allLogs = [...logs, ...(apiLogs || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const testConnection = async () => {
    addLog('info', 'Testing API connection...');
    try {
      const response = await apiClient.get('/admin/club-cottonwood/stats');
      addLog('info', 'API connection successful', JSON.stringify(response.data, null, 2));
    } catch (err) {
      addLog('error', 'API connection failed', (err as Error).message);
    }
  };

  const testSync = async () => {
    addLog('info', 'Starting sync test...');
    try {
      const response = await apiClient.post('/admin/club-cottonwood/sync', {}, { timeout: 300000 });
      addLog('info', 'Sync completed successfully', JSON.stringify(response.data, null, 2));
    } catch (err) {
      addLog('error', 'Sync failed', (err as Error).message);
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-amber-600 bg-amber-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600 text-sm mt-1">Real-time event monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-refresh
          </label>
          <button
            onClick={testConnection}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Test Connection
          </button>
          <button
            onClick={testSync}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Test Sync
          </button>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Refresh
          </button>
          <button
            onClick={() => setLogs([])}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-gray-600">
              {isLoading ? 'Loading...' : error ? 'API Error' : 'Connected'}
            </span>
          </div>
          <div className="text-gray-500">
            {allLogs.length} entries
          </div>
          <div className="text-gray-500">
            API: {apiClient.defaults.baseURL}
          </div>
        </div>
      </div>

      {/* Logs Container */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="h-[calc(100vh-280px)] overflow-y-auto p-4 font-mono text-sm">
          {allLogs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No logs yet. Click "Test Connection" to start.</div>
          ) : (
            allLogs.map((log, index) => (
              <div key={index} className="py-1 border-b border-gray-800 last:border-0">
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 flex-shrink-0">{formatTimestamp(log.timestamp)}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase flex-shrink-0 ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="text-gray-200">{log.message}</span>
                </div>
                {log.details && (
                  <pre className="mt-1 ml-24 text-xs text-gray-400 whitespace-pre-wrap">{log.details}</pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

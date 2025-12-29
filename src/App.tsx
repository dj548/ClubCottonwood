import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClubCottonwood from './ClubCottonwood';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🦆</span>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Club Cottonwood</h1>
              <p className="text-sm text-gray-500">Membership Management</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <ClubCottonwood />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;

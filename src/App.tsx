import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClubCottonwood from './ClubCottonwood';
import DuckIcon from './components/DuckIcon';

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
      <div className="min-h-screen bg-[#f3f4f6]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="max-w-[1600px] mx-auto flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #6FA7CE 0%, #8EBC67 100%)' }}
            >
              <DuckIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Club Cottonwood</h1>
              <p className="text-sm text-gray-500">Membership Management</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <ClubCottonwood />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;

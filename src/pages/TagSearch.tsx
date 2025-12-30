import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clubCottonwoodApi } from '../api/clubCottonwood';

interface CustomerResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tags: string[];
  ordersCount: number;
  totalSpent: string;
}

export default function TagSearch() {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchTag, setSearchTag] = useState<string>('');

  // Fetch available tags
  const { data: tags, isLoading: loadingTags } = useQuery({
    queryKey: ['tags'],
    queryFn: () => clubCottonwoodApi.getTags(),
  });

  // Fetch customers with selected tag
  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers-by-tag', searchTag],
    queryFn: () => clubCottonwoodApi.getCustomersByTag(searchTag),
    enabled: !!searchTag,
  });

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
  };

  const handleSearch = () => {
    if (selectedTag) {
      setSearchTag(selectedTag);
    }
  };

  const popularTags = tags?.slice(0, 20) || [];

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tag Search</h1>
        <p className="text-sm text-gray-500">
          Search for customers by Shopify tags
        </p>
      </div>

      {/* Tag Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Tag</h2>

        {loadingTags ? (
          <div className="text-gray-500">Loading tags...</div>
        ) : (
          <>
            {/* Popular Tags */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Popular Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagSelect(tag.name)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedTag === tag.name
                        ? 'text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={
                      selectedTag === tag.name
                        ? { background: 'linear-gradient(135deg, #6FA7CE 0%, #8EBC67 100%)' }
                        : {}
                    }
                  >
                    {tag.name}
                    <span className="ml-1 opacity-75">({tag.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Or enter a custom tag
                </label>
                <input
                  type="text"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  placeholder="Enter tag name..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6FA7CE] focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={!selectedTag}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #6FA7CE 0%, #8EBC67 100%)' }}
                >
                  Search
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Results */}
      {searchTag && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Customers with tag "{searchTag}"
            </h2>
            {customers && (
              <p className="text-sm text-gray-500">{customers.length} customers found</p>
            )}
          </div>

          {loadingCustomers ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="animate-spin w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Searching customers...
            </div>
          ) : customers && customers.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer: CustomerResult) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{customer.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{customer.ordersCount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{customer.totalSpent}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {customer.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {customer.tags.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{customer.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No customers found with tag "{searchTag}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

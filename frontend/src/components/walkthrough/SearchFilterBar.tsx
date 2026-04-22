import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

export interface SearchFilters {
  search: string;
  status: string;
  client: string;
}

interface SearchFilterBarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  clients: string[];
}

function SearchFilterBar({ filters, onChange, clients }: SearchFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ ...filters, search: localSearch });
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const hasActiveFilters = filters.status || filters.client || filters.search;

  const clearFilters = () => {
    setLocalSearch('');
    onChange({ search: '', status: '', client: '' });
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search projects, clients, addresses..."
          className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-500" />
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={filters.client}
          onChange={(e) => onChange({ ...filters, client: e.target.value })}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500 transition-colors min-w-[140px]"
        >
          <option value="">All Clients</option>
          {clients.map((client) => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Clear filters"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchFilterBar;

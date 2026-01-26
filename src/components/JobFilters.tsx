import React from 'react';
import { Search, SlidersHorizontal, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { SortOption, DateFilter } from '../types/enums';

interface JobFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  locationFilter: string;
  onLocationChange: (value: string) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (value: DateFilter) => void;
  totalJobs: number;
  filteredCount: number;
  onClearFilters: () => void;
}

/**
 * Component for job search and filtering controls
 */
export const JobFilters: React.FC<JobFiltersProps> = ({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  sortBy,
  onSortChange,
  locationFilter,
  onLocationChange,
  dateFilter,
  onDateFilterChange,
  totalJobs,
  filteredCount,
  onClearFilters,
}) => {
  const hasActiveFilters = locationFilter || dateFilter !== DateFilter.ALL || searchTerm;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-3.5 text-gray-400"
            size={20}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search by company, role, or location..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onSearchChange(e.target.value)
            }
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-label="Search jobs"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
            showFilters
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          aria-label={showFilters ? 'Hide filters' : 'Show filters'}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={20} />
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          role="region"
          aria-label="Filter options"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sort By */}
            <div>
              <label
                htmlFor="sort-select"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                <TrendingUp size={16} className="inline mr-1" />
                Sort By
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={SortOption.CONNECTIONS}>Most Connections</option>
                <option value={SortOption.DATE}>Newest First</option>
                <option value={SortOption.COMPANY}>Company A-Z</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label
                htmlFor="location-input"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                <MapPin size={16} className="inline mr-1" />
                Location{' '}
                <span className="text-xs text-gray-500 font-normal ml-1">
                  | Hint: For US locations, search by city/state.
                </span>
              </label>
              <input
                id="location-input"
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => onLocationChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Date Filter */}
            <div>
              <label
                htmlFor="date-select"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                <Calendar size={16} className="inline mr-1" />
                Posted Date
              </label>
              <select
                id="date-select"
                value={dateFilter}
                onChange={(e) => onDateFilterChange(e.target.value as DateFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={DateFilter.ALL}>All Time</option>
                <option value={DateFilter.WEEK}>Last 7 Days</option>
                <option value={DateFilter.MONTH}>Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-gray-300 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredCount}</span> of{' '}
              <span className="font-semibold">{totalJobs}</span> jobs
            </p>
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                aria-label="Clear all filters"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import { type KeyboardEvent } from 'react';
import type { StageOption } from './dashboardConstants';
import type { JourneyStage } from './types';

interface ControlPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStages: JourneyStage[];
  onToggleStage: (stage: JourneyStage) => void;
  stageOptions: StageOption[];
  availableOwners: string[];
  selectedOwners: string[];
  onToggleOwner: (owner: string) => void;
  onClearFilters: () => void;
  onCreateCustomer: () => void;
  hasActiveFilters: boolean;
}

const ControlPanel = ({
  searchQuery,
  onSearchChange,
  selectedStages,
  onToggleStage,
  stageOptions,
  availableOwners,
  selectedOwners,
  onToggleOwner,
  onClearFilters,
  onCreateCustomer,
  hasActiveFilters,
}: ControlPanelProps) => {
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onSearchChange('');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4" role="region" aria-label="Customer Filters and Actions">
      {/* Header with Search and Create Customer */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search customers..."
              className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Search customers"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateCustomer}
          className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          aria-label="Create new customer for AI analysis"
        >
          New Customer
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Stage Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Stage:</span>
          <div className="flex gap-1" role="group" aria-label="Journey stage filters">
            {stageOptions.map(({ stage, count }) => {
              const isActive = selectedStages.includes(stage);
              const isDisabled = count === 0;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => {
                    if (!isDisabled) {
                      onToggleStage(stage);
                    }
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : isDisabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={isDisabled}
                  aria-label={`Filter by ${stage} stage`}
                  aria-pressed={isActive}
                  aria-disabled={isDisabled}
                >
                  <span>{stage}</span>
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] px-1 rounded-full bg-white text-gray-600 border border-gray-200">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Owner Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Owner:</span>
          <div className="flex gap-1" role="group" aria-label="Owner filters">
            {availableOwners.map(owner => {
              const isActive = selectedOwners.includes(owner);
              return (
                <button
                  key={owner}
                  type="button"
                  onClick={() => onToggleOwner(owner)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label={`Filter by owner ${owner}`}
                  aria-pressed={isActive}
                >
                  {owner}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="ml-auto text-xs text-gray-600 hover:text-gray-900"
            aria-label="Clear all filters"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;

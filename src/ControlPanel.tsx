import { type KeyboardEvent } from 'react';
import type { RiskLevel, JourneyStage } from './types';

interface ControlPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRiskLevels: RiskLevel[];
  onToggleRiskLevel: (level: RiskLevel) => void;
  selectedStages: JourneyStage[];
  onToggleStage: (stage: JourneyStage) => void;
  onClearFilters: () => void;
  onCreateCustomer: () => void;
  hasActiveFilters: boolean;
}

const ControlPanel = ({
  searchQuery,
  onSearchChange,
  selectedRiskLevels,
  onToggleRiskLevel,
  selectedStages,
  onToggleStage,
  onClearFilters,
  onCreateCustomer,
  hasActiveFilters,
}: ControlPanelProps) => {
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onSearchChange('');
    }
  };

  const riskLevels: RiskLevel[] = ['critical', 'high', 'medium', 'low'];
  const stages: JourneyStage[] = ['Acquisition', 'Onboarding', 'Support', 'Renewal'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6" role="region" aria-label="Customer Filters and Actions">
      {/* Header with Search and Create Customer */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search customers by name..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search customers"
            />
            {searchQuery && (
              <button
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
          onClick={onCreateCustomer}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
          aria-label="Create new customer for AI analysis"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Customer
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Risk Level Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Risk:</span>
          <div className="flex gap-1" role="group" aria-label="Risk level filters">
            {riskLevels.map(level => {
              const isActive = selectedRiskLevels.includes(level);
              const colors = {
                critical: isActive ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100',
                high: isActive ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100',
                medium: isActive ? 'bg-yellow-600 text-white' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
                low: isActive ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100',
              };
              return (
                <button
                  key={level}
                  onClick={() => onToggleRiskLevel(level)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${colors[level]}`}
                  aria-label={`Filter by ${level} risk`}
                  aria-pressed={isActive ? 'true' : 'false'}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Stage:</span>
          <div className="flex gap-1" role="group" aria-label="Journey stage filters">
            {stages.map(stage => {
              const isActive = selectedStages.includes(stage);
              return (
                <button
                  key={stage}
                  onClick={() => onToggleStage(stage)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label={`Filter by ${stage} stage`}
                  aria-pressed={isActive ? 'true' : 'false'}
                >
                  {stage}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="ml-auto px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
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

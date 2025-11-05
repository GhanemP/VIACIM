import { useState, useEffect, useMemo } from 'react';
import type { JourneyEvent, JourneyStage } from './types';

interface CompactFiltersProps {
  events: JourneyEvent[];
  onFilterChange: (filteredEvents: JourneyEvent[]) => void;
}

const CompactFilters = ({ events, onFilterChange }: CompactFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<JourneyStage[]>([]);

  const availableChannels = useMemo(() => {
    const channels = events.map(e => e.channel);
    return [...new Set(channels)];
  }, [events]);

  const availableStages = useMemo(() => {
    const stages = events.map(e => e.stage);
    return [...new Set(stages)];
  }, [events]);

  // Initialize all filters as selected
  useEffect(() => {
    if (availableChannels.length > 0 && selectedChannels.length === 0) {
      setSelectedChannels(availableChannels);
    }
    if (availableStages.length > 0 && selectedStages.length === 0) {
      setSelectedStages(availableStages);
    }
  }, [availableChannels, availableStages, selectedChannels.length, selectedStages.length]);

  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedChannels.length > 0) {
      filtered = filtered.filter(event => selectedChannels.includes(event.channel));
    }

    if (selectedStages.length > 0) {
      filtered = filtered.filter(event => selectedStages.includes(event.stage));
    }

    onFilterChange(filtered);
  }, [searchTerm, selectedChannels, selectedStages, events, onFilterChange]);

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  const toggleStage = (stage: JourneyStage) => {
    setSelectedStages(prev =>
      prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
    );
  };

  const getStageColor = (stage: JourneyStage) => {
    switch (stage) {
      case 'Acquisition': return 'bg-violet-100 text-violet-700 border-violet-300';
      case 'Onboarding': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Support': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Renewal': return 'bg-amber-100 text-amber-700 border-amber-300';
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedChannels(availableChannels);
    setSelectedStages(availableStages);
  };

  const hasActiveFilters = searchTerm !== '' ||
    selectedChannels.length !== availableChannels.length ||
    selectedStages.length !== availableStages.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-700 mb-2 block">
          Search Events
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title or summary..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Journey Stages */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-700 mb-2 block">
          Journey Stage
        </label>
        <div className="space-y-2">
          {availableStages.map((stage) => (
            <label
              key={stage}
              className={`
                flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border
                ${selectedStages.includes(stage) ? getStageColor(stage) : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}
              `}
            >
              <input
                type="checkbox"
                checked={selectedStages.includes(stage)}
                onChange={() => toggleStage(stage)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium flex-1">{stage}</span>
              <span className="text-xs font-bold">
                {events.filter(e => e.stage === stage).length}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Channels */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-700 mb-2 block">
          Channel Type
        </label>
        <div className="space-y-2">
          {availableChannels.map((channel) => {
            const channelIcons: Record<string, string> = {
              voice: '📞',
              email: '✉️',
              crm: '📊',
              chat: '💬',
            };

            return (
              <label
                key={channel}
                className={`
                  flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border
                  ${selectedChannels.includes(channel)
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedChannels.includes(channel)}
                  onChange={() => toggleChannel(channel)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-base">{channelIcons[channel]}</span>
                <span className="text-sm font-medium capitalize flex-1">{channel}</span>
                <span className="text-xs font-bold">
                  {events.filter(e => e.channel === channel).length}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Showing <span className="font-bold text-gray-900">{events.filter(e => {
            let matches = true;
            if (searchTerm) {
              matches = matches && (
                e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.summary.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }
            if (selectedChannels.length > 0) {
              matches = matches && selectedChannels.includes(e.channel);
            }
            if (selectedStages.length > 0) {
              matches = matches && selectedStages.includes(e.stage);
            }
            return matches;
          }).length}</span> of <span className="font-bold text-gray-900">{events.length}</span> events
        </p>
      </div>
    </div>
  );
};

export default CompactFilters;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { JourneyEvent } from './types';

interface FilterControlsProps {
  events: JourneyEvent[];
  onFilterChange: (filteredEvents: JourneyEvent[]) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ events, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const eventChannels = useMemo(() => {
    const allChannels = events.map(e => e.channel);
    return [...new Set(allChannels)];
  }, [events]);

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

    onFilterChange(filtered);
  }, [searchTerm, selectedChannels, events, onFilterChange]);

  const handleChannelChange = useCallback((channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel) ? prev.filter(t => t !== channel) : [...prev, channel]
    );
  }, []);
  
  // Initialize selected channels to all available channels
  useEffect(() => {
    if (eventChannels.length > 0) {
      setSelectedChannels(eventChannels);
    }
  }, [eventChannels]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Filters & Search</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search Events
          </label>
          <input
            type="text"
            id="search"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., 'Product Launch'"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by Channel
          </label>
          <div className="mt-2 space-y-2">
            {eventChannels.map(channel => (
              <div key={channel} className="flex items-center">
                <input
                  id={`filter-${channel}`}
                  name={`filter-${channel}`}
                  type="checkbox"
                  checked={selectedChannels.includes(channel)}
                  onChange={() => handleChannelChange(channel)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={`filter-${channel}`} className="ml-3 text-sm text-gray-600 capitalize">
                  {channel.replace(/_/g, ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;

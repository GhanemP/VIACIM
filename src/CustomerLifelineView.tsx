import { useState, useMemo, useEffect } from 'react';
import type { Customer, TimelineFilters, ChannelType, JourneyStage, TagType } from './types';
import HorizontalLifeline from './HorizontalLifeline';
import EvidenceDrawer from './EvidenceDrawer';
import JourneyNarration from './JourneyNarration';
import { trackEvent } from './telemetry';

interface CustomerLifelineViewProps {
  customer: Customer;
  onBack: () => void;
  onSwitchView?: () => void;
}

// S6: URL state sync helpers
const useURLState = () => {
  const [urlParams, setUrlParams] = useState<URLSearchParams>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(urlParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?${newParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }

    setUrlParams(newParams);
  };

  return { urlParams, updateURL };
};

const CustomerLifelineView = ({ customer, onBack, onSwitchView }: CustomerLifelineViewProps) => {
  const { urlParams, updateURL } = useURLState();

  // S6: Initialize state from URL
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    urlParams.get('event') || null
  );

  const [filters, setFilters] = useState<TimelineFilters>(() => {
    const channelsParam = urlParams.get('channels');
    const stagesParam = urlParams.get('stages');
    const tagsParam = urlParams.get('tags');
    const windowParam = urlParams.get('window');

    return {
      channels: channelsParam ? (channelsParam.split(',') as ChannelType[]) : ['voice', 'email', 'crm', 'chat'],
      stages: stagesParam ? (stagesParam.split(',') as JourneyStage[]) : ['Acquisition', 'Onboarding', 'Support', 'Renewal'],
      tags: tagsParam ? (tagsParam.split(',') as TagType[]) : [],
      timeWindow: (windowParam === '12m' || windowParam === '90d' || windowParam === '30d') ? windowParam : 'all',
      searchQuery: urlParams.get('q') || '',
    };
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Update URL when selection changes
  useEffect(() => {
    updateURL({ event: selectedEventId || '' });
  }, [selectedEventId, updateURL]);

  // Track event selection
  useEffect(() => {
    if (selectedEventId) {
      trackEvent({ type: 'EVENT_INSPECTED', payload: { eventId: selectedEventId, customerId: customer.id } });
    }
  }, [selectedEventId, customer.id]);

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    let events = customer.interactions;

    // Channel filter
    if (filters.channels.length > 0) {
      events = events.filter(e => filters.channels.includes(e.channel));
    }

    // Stage filter
    if (filters.stages.length > 0) {
      events = events.filter(e => filters.stages.includes(e.stage));
    }

    // Tag filter
    if (filters.tags.length > 0) {
      events = events.filter(e => e.tags.some(tag => filters.tags.includes(tag)));
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.summary.toLowerCase().includes(query)
      );
    }

    // Time window
    if (filters.timeWindow !== 'all') {
      const now = new Date();
      let cutoff: Date;

      switch (filters.timeWindow) {
        case '30d':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '12m':
          cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = new Date(0);
      }

      events = events.filter(e => new Date(e.ts) >= cutoff);
    }

    return events;
  }, [customer.interactions, filters]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return customer.interactions.find(e => e.id === selectedEventId) ?? null;
  }, [customer.interactions, selectedEventId]);

  const handleEventSelect = (eventId: string | null) => {
    setSelectedEventId(eventId);
    setIsDrawerOpen(!!eventId);
  };

  const toggleFilter = (
    type: 'channels' | 'stages' | 'tags',
    value: string
  ) => {
    setFilters(prev => {
      const current = prev[type] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];

      trackEvent({
        type: 'FILTER_APPLY',
        payload: { filterType: type, value, action: current.includes(value) ? 'remove' : 'add' }
      });

      return { ...prev, [type]: updated };
    });
  };

  const setTimeWindow = (window: 'all' | '12m' | '90d' | '30d') => {
    setFilters(prev => ({ ...prev, timeWindow: window }));
    updateURL({ window });
    trackEvent({ type: 'FILTER_APPLY', payload: { filterType: 'timeWindow', value: window } });
  };

  const setSearchQuery = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
    updateURL({ q: query });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to dashboard"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                <p className="text-sm text-gray-600">{customer.stage} • {customer.assignedTo}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {onSwitchView && (
                <button
                  onClick={onSwitchView}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  title="Switch to Journey View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Journey View</span>
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Health:</span>
                <span className={`text-xl font-bold ${getHealthColor(customer.healthScore)}`}>
                  {customer.healthScore}
                </span>
              </div>
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getRiskColor(customer.riskLevel)}`}>
                {customer.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Narration Bar */}
      <JourneyNarration events={filteredEvents} />

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Time Window */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Time:</span>
            {(['all', '12m', '90d', '30d'] as const).map(window => (
              <button
                key={window}
                onClick={() => setTimeWindow(window)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filters.timeWindow === window
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {window === 'all' ? 'All Time' : window.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Event count */}
          <div className="text-sm text-gray-600">
            <span className="font-bold">{filteredEvents.length}</span> of {customer.interactions.length} events
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs font-medium text-gray-600">Quick Filters:</span>

          {/* Tags */}
          {(['risk', 'opportunity', 'flag', 'compliance'] as const).map(tag => (
            <button
              key={tag}
              onClick={() => toggleFilter('tags', tag)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filters.tags.includes(tag)
                  ? tag === 'risk' ? 'bg-red-500 text-white' :
                    tag === 'opportunity' ? 'bg-green-500 text-white' :
                    tag === 'flag' ? 'bg-yellow-500 text-white' : 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}

          {/* Channels */}
          {(['voice', 'email', 'chat', 'crm'] as const).map(channel => (
            <button
              key={channel}
              onClick={() => toggleFilter('channels', channel)}
              className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                filters.channels.includes(channel)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <HorizontalLifeline
            events={filteredEvents}
            selectedEventId={selectedEventId}
            onEventSelect={handleEventSelect}
            height={500}
          />
        </div>
      </div>

      {/* Evidence Drawer */}
      <EvidenceDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedEventId(null);
        }}
      />

      {/* Keyboard shortcuts hint */}
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2 text-xs text-gray-600">
        <kbd className="px-2 py-1 bg-gray-100 rounded">Drag</kbd> to pan • <kbd className="px-2 py-1 bg-gray-100 rounded">Scroll</kbd> to zoom • <kbd className="px-2 py-1 bg-gray-100 rounded">Click</kbd> event for details
      </div>
    </div>
  );
};

export default CustomerLifelineView;

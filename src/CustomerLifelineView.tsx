import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Customer, TimelineFilters, ChannelType, JourneyStage, TagType } from './types';
import type { InsightDataL2 } from './insightTypes';
import HorizontalLifeline from './HorizontalLifeline';
import EvidenceDrawer from './EvidenceDrawer';
import JourneyNarration from './JourneyNarration';
import { trackEvent } from './telemetry';
import { demoInsightsById } from './demoInsights';

interface CustomerLifelineViewProps {
  customer: Customer;
  onBack: () => void;
  onSwitchView?: () => void;
  onOpenInsight?: (insightId: string) => void;
}

// S6: URL state sync helpers
const useURLState = () => {
  const [urlParams, setUrlParams] = useState<URLSearchParams>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });

  const updateURL = useCallback((params: Record<string, string>) => {
    setUrlParams(prevParams => {
      const nextParams = new URLSearchParams(prevParams);
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          nextParams.set(key, value);
        } else {
          nextParams.delete(key);
        }
      });

      const prevString = prevParams.toString();
      const nextString = nextParams.toString();

      if (typeof window !== 'undefined' && nextString !== prevString) {
        const nextUrl = nextString ? `${window.location.pathname}?${nextString}` : window.location.pathname;
        window.history.replaceState({}, '', nextUrl);
      }

      return nextString === prevString ? prevParams : nextParams;
    });
  }, []);

  return { urlParams, updateURL };
};

const CustomerLifelineView = ({ customer, onBack, onSwitchView, onOpenInsight }: CustomerLifelineViewProps) => {
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

  const linkedInsights = useMemo<InsightDataL2[]>(() => {
    const ids = new Set<string>();
    customer.interactions.forEach((interaction) => {
      if (interaction.linkedInsightId) {
        ids.add(interaction.linkedInsightId);
      }
    });

    return Array.from(ids)
      .map((id) => demoInsightsById[id])
      .filter((insight): insight is InsightDataL2 => Boolean(insight));
  }, [customer.interactions]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vibrant Gradient Header */}
      <header className="gradient-header sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="btn-glass p-2"
                aria-label="Back to dashboard"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{customer.name}</h1>
                <p className="text-sm text-white/90">{customer.stage} • {customer.assignedTo}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Metrics in Header */}
              <div className="metric-card">
                <div>
                  <div className="text-lg font-bold text-white">{customer.healthScore}</div>
                  <div className="text-xs text-white/80">Health</div>
                </div>
              </div>
              <div className="metric-card">
                <div>
                  <div className="text-lg font-bold text-white">${customer.mrr.toLocaleString()}</div>
                  <div className="text-xs text-white/80">MRR</div>
                </div>
              </div>
              <div className="metric-card">
                <div>
                  <div className="text-lg font-bold text-white">${(customer.mrr * (customer.riskLevel === 'critical' ? 1 : customer.riskLevel === 'high' ? 0.5 : 0)).toLocaleString()}</div>
                  <div className="text-xs text-white/80">ARR at Risk</div>
                </div>
              </div>
              {onSwitchView && (
                <button
                  type="button"
                  onClick={onSwitchView}
                  className="btn-glass"
                  title="Switch to Journey View"
                >
                  Journey View
                </button>
              )}
              <span className={`
                px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide
                ${customer.riskLevel === 'critical' ? 'badge-critical' :
                  customer.riskLevel === 'high' ? 'badge-high' :
                  customer.riskLevel === 'medium' ? 'badge-medium' : 'badge-low'}
              `}>
                {customer.riskLevel}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Narration Bar */}
      <JourneyNarration events={filteredEvents} />

      {linkedInsights.length > 0 && (
        <section className="px-6 pt-4">
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">✨</span>
                <h2 className="text-lg font-semibold text-indigo-900">Related AI Insights</h2>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{linkedInsights.length} linked</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {linkedInsights.map((insight) => (
                <article
                  key={insight.id}
                  className="h-full rounded-lg border border-indigo-100 bg-white/70 backdrop-blur-sm p-4 flex flex-col gap-3 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{insight.category}</span>
                    {insight.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full border border-indigo-200 text-indigo-600 bg-white">
                        {insight.badge.label}: {insight.badge.value}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-indigo-900 leading-snug line-clamp-2" title={insight.title}>{insight.title}</h3>
                  <p className="text-xs text-indigo-700 leading-relaxed line-clamp-3">{insight.problem}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-indigo-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(insight.timestamp).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {insight.evidence.tickets} tickets
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenInsight?.(insight.id)}
                    className="mt-2 inline-flex items-center justify-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    Open in AI Insights
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

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

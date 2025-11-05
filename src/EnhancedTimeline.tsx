import { useMemo } from 'react';
import type { JourneyEvent, JourneyStage } from './types';

interface EnhancedTimelineProps {
  events: JourneyEvent[];
  selectedEventId: string | null;
  onEventSelect: (eventId: string | null) => void;
}

const STAGE_COLORS: Record<JourneyStage, { bg: string; border: string; text: string; icon: string }> = {
  Acquisition: {
    bg: 'bg-violet-100',
    border: 'border-violet-400',
    text: 'text-violet-700',
    icon: '🎯'
  },
  Onboarding: {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-700',
    icon: '🚀'
  },
  Support: {
    bg: 'bg-emerald-100',
    border: 'border-emerald-400',
    text: 'text-emerald-700',
    icon: '💬'
  },
  Renewal: {
    bg: 'bg-amber-100',
    border: 'border-amber-400',
    text: 'text-amber-700',
    icon: '🔄'
  },
};

const CHANNEL_ICONS: Record<string, string> = {
  voice: '📞',
  email: '✉️',
  crm: '📊',
  chat: '💬',
};

const EnhancedTimeline = ({ events, selectedEventId, onEventSelect }: EnhancedTimelineProps) => {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [events]);

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const eventDate = new Date(timestamp);
    const diffMs = now.getTime() - eventDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'very-positive': return 'text-green-600 bg-green-50';
      case 'positive': return 'text-green-500 bg-green-50';
      case 'neutral': return 'text-gray-500 bg-gray-50';
      case 'negative': return 'text-orange-500 bg-orange-50';
      case 'very-negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">No events to display</p>
        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical Timeline Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200" />

      {/* Events */}
      <div className="space-y-4">
        {sortedEvents.map((event) => {
          const isSelected = event.id === selectedEventId;
          const stageStyle = STAGE_COLORS[event.stage];

          return (
            <div
              key={event.id}
              className="relative pl-16 pr-4"
            >
              {/* Timeline Dot */}
              <div className={`absolute left-3 w-6 h-6 rounded-full border-4 ${isSelected ? 'border-blue-500 bg-blue-500 scale-125' : `${stageStyle.border} ${stageStyle.bg}`} transition-all shadow-md flex items-center justify-center`}>
                {!isSelected && <span className="text-xs">{STAGE_COLORS[event.stage].icon}</span>}
              </div>

              {/* Event Card */}
              <div
                onClick={() => onEventSelect(event.id === selectedEventId ? null : event.id)}
                className={`
                  bg-white rounded-lg border-2 p-4 cursor-pointer transition-all
                  ${isSelected
                    ? 'border-blue-500 shadow-lg scale-[1.02]'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{CHANNEL_ICONS[event.channel]}</span>
                      <h3 className="font-bold text-gray-900">{event.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{event.summary}</p>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {getRelativeTime(event.ts)}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {formatDuration(event.durationSec)}
                  </div>
                  <div className={`px-2 py-0.5 rounded-full ${stageStyle.bg} ${stageStyle.text} font-medium`}>
                    {event.stage}
                  </div>
                </div>

                {/* Risk/Sentiment Footer */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  {event.score.risk > 50 && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-red-600">⚠️ Risk: {event.score.risk}</span>
                    </div>
                  )}
                  {event.score.opportunity > 50 && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-green-600">✨ Opportunity: {event.score.opportunity}</span>
                    </div>
                  )}
                  <div className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(event.sentiment)}`}>
                    {event.sentiment}
                  </div>
                </div>

                {/* Click to view indicator */}
                {!isSelected && (
                  <div className="mt-2 text-xs text-blue-600 font-medium text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view details →
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline End */}
      <div className="relative pl-16 pr-4 mt-4">
        <div className="absolute left-3 w-6 h-6 rounded-full border-4 border-gray-300 bg-gray-100 flex items-center justify-center">
          <span className="text-xs">🏁</span>
        </div>
        <div className="text-sm text-gray-400 italic">Journey start</div>
      </div>
    </div>
  );
};

export default EnhancedTimeline;

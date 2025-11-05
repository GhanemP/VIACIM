import type { JourneyEvent } from './types';

interface EventInspectorProps {
  event: JourneyEvent | null;
}

const EventInspector = ({ event }: EventInspectorProps) => {
  if (!event) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p className="text-sm font-medium">Select an event</p>
          <p className="text-xs mt-1">Click any event to view details</p>
        </div>
      </div>
    );
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Acquisition': return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'Onboarding': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Support': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Renewal': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'very-positive': return '😊';
      case 'positive': return '🙂';
      case 'neutral': return '😐';
      case 'negative': return '😟';
      case 'very-negative': return '😢';
      default: return '😐';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-lg font-bold text-gray-900">Event Details</h3>
        <p className="text-xs text-gray-600 mt-1">Full interaction information</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title & ID */}
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h4>
          <p className="text-xs text-gray-500 font-mono">ID: {event.id}</p>
        </div>

        {/* Stage Badge */}
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStageColor(event.stage)}`}>
            {event.stage}
          </span>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700 leading-relaxed">{event.summary}</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium mb-1">Channel</p>
            <p className="text-sm font-bold text-blue-900 capitalize">{event.channel}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <p className="text-xs text-purple-600 font-medium mb-1">Duration</p>
            <p className="text-sm font-bold text-purple-900">
              {event.durationSec < 60 ? `${event.durationSec}s` : `${Math.floor(event.durationSec / 60)}m`}
            </p>
          </div>
        </div>

        {/* Timestamp */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-600 mb-1">Timestamp</p>
          <p className="text-sm font-medium text-gray-900">{new Date(event.ts).toLocaleString()}</p>
        </div>

        {/* Participants */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-600 mb-2">Participants</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                A
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{event.agent}</p>
                <p className="text-xs text-gray-500">Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                C
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{event.customer}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-600 mb-3">Risk & Opportunity Scores</p>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Risk</span>
                <span className={`text-sm font-bold ${event.score.risk > 70 ? 'text-red-600' : event.score.risk > 40 ? 'text-orange-600' : 'text-green-600'}`}>
                  {event.score.risk}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${event.score.risk > 70 ? 'bg-red-500' : event.score.risk > 40 ? 'bg-orange-500' : 'bg-green-500'}`}
                  style={{ width: `${event.score.risk}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Opportunity</span>
                <span className={`text-sm font-bold ${event.score.opportunity > 70 ? 'text-green-600' : event.score.opportunity > 40 ? 'text-blue-600' : 'text-gray-600'}`}>
                  {event.score.opportunity}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${event.score.opportunity > 70 ? 'bg-green-500' : event.score.opportunity > 40 ? 'bg-blue-500' : 'bg-gray-500'}`}
                  style={{ width: `${event.score.opportunity}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-600 mb-2">Sentiment Analysis</p>
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
            <span className="text-2xl">{getSentimentEmoji(event.sentiment)}</span>
            <span className="text-sm font-semibold text-gray-900 capitalize">{event.sentiment.replace('-', ' ')}</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-600 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    tag === 'risk' ? 'bg-red-100 text-red-700' :
                    tag === 'opportunity' ? 'bg-green-100 text-green-700' :
                    tag === 'flag' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {event.aiInsights && event.aiInsights.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-600 mb-2">AI Insights</p>
            <div className="space-y-2">
              {event.aiInsights.map((insight) => (
                <div key={insight.id} className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                  <p className="text-sm font-semibold text-indigo-900 mb-1">{insight.title}</p>
                  <p className="text-xs text-indigo-700">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {event.recommendedActions && event.recommendedActions.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-600 mb-2">Recommended Actions</p>
            <div className="space-y-2">
              {event.recommendedActions.map((action) => (
                <div key={action.id} className="flex items-start gap-2 bg-green-50 rounded-lg p-3 border border-green-100">
                  <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-green-900 font-medium">{action.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Info */}
        <div className="border-t border-gray-200 pt-4">
          <details className="cursor-pointer">
            <summary className="text-xs text-gray-600 font-medium">Technical Details</summary>
            <div className="mt-2 space-y-2 text-xs text-gray-600 font-mono bg-gray-50 rounded p-2">
              <div><span className="font-bold">Conversation:</span> {event.conversation_id}</div>
              <div><span className="font-bold">Span:</span> {event.span_id}</div>
              <div><span className="font-bold">System:</span> {event.record.system}</div>
              <div><span className="font-bold">Object:</span> {event.record.object}</div>
              <div><span className="font-bold">Record:</span> {event.record.record_id}</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default EventInspector;

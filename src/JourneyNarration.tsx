import { useMemo } from 'react';
import type { JourneyEvent, JourneySummary } from './types';

interface JourneyNarrationProps {
  events: JourneyEvent[];
  customerName: string;
}

// S10: Generate journey narration from events
const generateNarration = (events: JourneyEvent[]): JourneySummary['narration'] => {
  if (events.length === 0) {
    return {
      start: 'No journey data available yet.',
      highlights: [],
      issues: [],
      improvements: [],
      currentStatus: 'Awaiting first interaction.',
      nextActions: ['Begin engagement with customer']
    };
  }

  const sortedEvents = [...events].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  const firstEvent = sortedEvents[0];
  const recentEvents = sortedEvents.slice(-5);

  // Calculate KPIs
  const riskEvents = events.filter(e => e.score.risk > 60);
  const oppEvents = events.filter(e => e.score.opportunity > 60);
  const highPriorityEvents = events.filter(e => e.priority === 'critical' || e.priority === 'high');

  // Start
  const start = `Journey began ${new Date(firstEvent.ts).toLocaleDateString()} with ${firstEvent.channel} ${firstEvent.stage.toLowerCase()} event: "${firstEvent.title}". Since then, ${events.length} interactions across ${new Set(events.map(e => e.channel)).size} channels.`;

  // Highlights
  const highlights: string[] = [];
  const positiveEvents = events.filter(e => e.sentiment === 'positive' || e.sentiment === 'very-positive');
  if (positiveEvents.length > 0) {
    highlights.push(`${positiveEvents.length} positive interactions with strong sentiment`);
  }
  if (oppEvents.length > 0) {
    const topOpp = oppEvents.sort((a, b) => b.score.opportunity - a.score.opportunity)[0];
    highlights.push(`Opportunity identified: "${topOpp.title}" (score: ${topOpp.score.opportunity})`);
  }
  if (highlights.length === 0) {
    highlights.push('Steady engagement maintained');
  }

  // Issues
  const issues: string[] = [];
  if (riskEvents.length > 0) {
    const topRisk = riskEvents.sort((a, b) => b.score.risk - a.score.risk)[0];
    issues.push(`⚠️ High risk detected: "${topRisk.title}" (risk score: ${topRisk.score.risk})`);
  }
  const negativeEvents = events.filter(e => e.sentiment === 'negative' || e.sentiment === 'very-negative');
  if (negativeEvents.length > 2) {
    issues.push(`${negativeEvents.length} interactions with negative sentiment require attention`);
  }
  const longDurations = events.filter(e => e.durationSec > 600);
  if (longDurations.length > 0) {
    issues.push(`${longDurations.length} extended interactions (>10min) may indicate complexity`);
  }

  // Improvements
  const improvements: string[] = [];
  const recent = recentEvents.slice(-3);
  const older = events.slice(0, Math.min(3, events.length - 5));

  if (recent.length > 0 && older.length > 0) {
    const recentAvgRisk = recent.reduce((sum, e) => sum + e.score.risk, 0) / recent.length;
    const olderAvgRisk = older.reduce((sum, e) => sum + e.score.risk, 0) / older.length;

    if (recentAvgRisk < olderAvgRisk - 10) {
      improvements.push(`Risk scores trending down (-${Math.round(olderAvgRisk - recentAvgRisk)} points)`);
    }
  }

  const stageProgression = [...new Set(sortedEvents.map(e => e.stage))];
  if (stageProgression.length > 1) {
    improvements.push(`Progressed through ${stageProgression.length} journey stages: ${stageProgression.join(' → ')}`);
  }

  // Current Status
  const lastEvent = recentEvents[recentEvents.length - 1];
  const daysSinceLastEvent = Math.floor((Date.now() - new Date(lastEvent.ts).getTime()) / (1000 * 60 * 60 * 24));

  let currentStatus = `Last contact: ${daysSinceLastEvent}d ago via ${lastEvent.channel}. `;
  if (highPriorityEvents.length > 0) {
    currentStatus += `${highPriorityEvents.length} high-priority items need attention. `;
  }
  if (riskEvents.length === 0) {
    currentStatus += 'Account health appears stable.';
  } else {
    currentStatus += `Monitoring ${riskEvents.length} risk factors.`;
  }

  // Next Actions
  const nextActions: string[] = [];
  if (daysSinceLastEvent > 14) {
    nextActions.push('Schedule follow-up contact - engagement gap detected');
  }
  if (riskEvents.length > 0) {
    nextActions.push(`Address top risk: "${riskEvents[0].title}"`);
  }
  if (oppEvents.length > 0) {
    nextActions.push(`Pursue opportunity: "${oppEvents[0].title}"`);
  }
  if (nextActions.length === 0) {
    nextActions.push('Continue regular cadence of touchpoints');
  }

  return {
    start,
    highlights,
    issues,
    improvements,
    currentStatus,
    nextActions
  };
};

const JourneyNarration = ({ events, customerName }: JourneyNarrationProps) => {
  const narration = useMemo(() => generateNarration(events), [events]);

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200">
      <div className="max-w-full px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900">Journey Summary</h3>
          <span className="text-xs text-gray-500 ml-auto">Auto-generated • {events.length} events analyzed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Start */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏁</span>
              <h4 className="text-xs font-bold text-gray-700 uppercase">Start</h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{narration.start}</p>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⭐</span>
              <h4 className="text-xs font-bold text-gray-700 uppercase">Highlights</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {narration.highlights.map((item, idx) => (
                <li key={idx} className="leading-relaxed">• {item}</li>
              ))}
            </ul>
          </div>

          {/* Issues */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚠️</span>
              <h4 className="text-xs font-bold text-gray-700 uppercase">Issues</h4>
            </div>
            {narration.issues.length > 0 ? (
              <ul className="text-sm text-gray-600 space-y-1">
                {narration.issues.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">• {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-600">No major issues detected</p>
            )}
          </div>

          {/* Improvements */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📈</span>
              <h4 className="text-xs font-bold text-gray-700 uppercase">Improvements</h4>
            </div>
            {narration.improvements.length > 0 ? (
              <ul className="text-sm text-gray-600 space-y-1">
                {narration.improvements.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">• {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Establishing baseline</p>
            )}
          </div>

          {/* Current Status */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📍</span>
              <h4 className="text-xs font-bold text-gray-700 uppercase">Current Status</h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{narration.currentStatus}</p>
          </div>

          {/* Next Actions */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-200 bg-gradient-to-br from-white to-indigo-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚡</span>
              <h4 className="text-xs font-bold text-indigo-700 uppercase">Next Actions</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              {narration.nextActions.map((item, idx) => (
                <li key={idx} className="leading-relaxed font-medium">• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyNarration;

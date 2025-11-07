import { useState } from 'react';
import type { JourneyEvent } from './types';

interface EvidenceDrawerProps {
  event: JourneyEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'summary' | 'evidence' | 'compliance' | 'actions';

const EvidenceDrawer = ({ event, isOpen, onClose }: EvidenceDrawerProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('evidence');

  if (!isOpen) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'voice': return '📞';
      case 'email': return '✉️';
      case 'chat': return '💬';
      case 'crm': return '📊';
      default: return '📄';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="sticky top-0 z-10 gradient-header px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Event Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-glass p-2"
            aria-label="Close drawer"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {event ? (
          <>
            {/* Event Header Info */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getChannelIcon(event.channel)}</span>
                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{new Date(event.ts).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getPriorityColor(event.priority)}`}>
                  {event.priority.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {event.durationSec}s
                </div>
                <div className="capitalize">{event.stage}</div>
                <div>Weight: {event.weight}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 bg-white">
              <div className="tab-nav">
                {[
                  { id: 'summary', label: 'Summary', icon: '📋' },
                  { id: 'evidence', label: 'Evidence', icon: '🔍' },
                  { id: 'compliance', label: 'Compliance', icon: '✓' },
                  { id: 'actions', label: 'Actions', icon: '⚡' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  {/* Summary Text */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-gray-700 leading-relaxed">{event.summary}</p>
                  </div>

                  {/* Participants */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Participants</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          A
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.agent}</div>
                          <div className="text-xs text-gray-500">Agent</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                          C
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.customer}</div>
                          <div className="text-xs text-gray-500">Customer</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Risk & Opportunity</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">Risk Score</span>
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
                          <span className="text-sm text-gray-700">Opportunity Score</span>
                          <span className={`text-sm font-bold ${event.score.opportunity > 70 ? 'text-green-600' : 'text-blue-600'}`}>
                            {event.score.opportunity}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${event.score.opportunity > 70 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${event.score.opportunity}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Impact */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Revenue Impact
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {event.tags.includes('risk') && (
                        <div className="bg-white/80 rounded p-3">
                          <p className="text-xs text-gray-600 mb-1">Churn Risk</p>
                          <p className="text-lg font-bold text-red-600">
                            ${(event.score.risk * 5).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">MRR at Risk</p>
                        </div>
                      )}
                      {event.tags.includes('opportunity') && (
                        <div className="bg-white/80 rounded p-3">
                          <p className="text-xs text-gray-600 mb-1">Upsell Potential</p>
                          <p className="text-lg font-bold text-green-600">
                            ${(event.score.opportunity * 10).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Expansion ARR</p>
                        </div>
                      )}
                      {!event.tags.includes('risk') && !event.tags.includes('opportunity') && (
                        <div className="col-span-2 bg-white/80 rounded p-3 text-center">
                          <p className="text-sm text-gray-600">No direct revenue impact detected</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {event.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              tag === 'risk' ? 'bg-red-100 text-red-700' :
                              tag === 'opportunity' ? 'bg-green-100 text-green-700' :
                              tag === 'flag' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Event Insights */}
                  {event.aiInsights && event.aiInsights.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3">Event Insights</h4>
                      <div className="space-y-2">
                        {event.aiInsights.map((insight) => (
                          <div key={insight.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200 shadow-sm">
                            <p className="text-sm font-semibold text-blue-900 mb-1">{insight.title}</p>
                            <p className="text-xs text-blue-700">{insight.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'evidence' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900">Transcript & Audio</h4>

                  {/* Transcript */}
                  {event.transcript ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Full Transcript</span>
                        <button className="text-xs text-blue-600 hover:text-blue-700">Search</button>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {event.transcript}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 text-sm">
                      No transcript available for this event
                    </div>
                  )}

                  {/* Evidence Spans */}
                  {event.evidence && event.evidence.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Key Moments</h4>
                      <div className="space-y-2">
                        {event.evidence.map((span, idx) => (
                          <div key={idx} className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                            <div className="text-xs text-yellow-700 font-medium mb-1">
                              {Math.floor(span.start / 60)}:{(span.start % 60).toString().padStart(2, '0')} - {Math.floor(span.end / 60)}:{(span.end % 60).toString().padStart(2, '0')}
                            </div>
                            <p className="text-sm text-gray-800">{span.text}</p>
                            {span.highlightReason && (
                              <p className="text-xs text-yellow-600 mt-1">💡 {span.highlightReason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Artifacts */}
                  {event.artifacts && event.artifacts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Artifacts</h4>
                      <div className="space-y-2">
                        {event.artifacts.map((artifact, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                            <div className="text-2xl">
                              {artifact.type === 'audio' ? '🎵' :
                               artifact.type === 'transcript' ? '📝' :
                               artifact.type === 'screen_recording' ? '🎬' : '📎'}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{artifact.name}</div>
                              <div className="text-xs text-gray-500 capitalize">{artifact.type}</div>
                            </div>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'compliance' && (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
                    <svg className="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-green-900">Compliance checks passed</p>
                    <p className="text-xs text-green-700 mt-1">All required data handling policies followed</p>
                  </div>

                  {event.tags.includes('compliance') && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-900 font-medium">✓ Tagged for compliance review</p>
                      <p className="text-xs text-blue-700 mt-1">This interaction has been flagged for additional compliance verification.</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">System Record</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600 space-y-1">
                      <div><span className="font-bold">System:</span> {event.record.system}</div>
                      <div><span className="font-bold">Object:</span> {event.record.object}</div>
                      <div><span className="font-bold">Record ID:</span> {event.record.record_id}</div>
                      <div><span className="font-bold">Conversation:</span> {event.conversation_id}</div>
                      <div><span className="font-bold">Span:</span> {event.span_id}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-4">
                  {event.recommendedActions && event.recommendedActions.length > 0 ? (
                    <>
                      <h4 className="text-sm font-bold text-gray-900">Recommended Next Actions</h4>
                      <div className="space-y-3">
                        {event.recommendedActions.map((action) => (
                          <button
                            key={action.id}
                            type="button"
                            className="w-full text-left btn-gradient-success rounded-lg p-4 transition-all group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-white mb-1">{action.title}</p>
                                {action.rationale && (
                                  <p className="text-xs text-white/90 mb-2">{action.rationale}</p>
                                )}
                                {action.expectedImpact && (
                                  <p className="text-xs text-white/80 mb-2">
                                    <span className="font-medium">Expected Impact:</span> {action.expectedImpact}
                                  </p>
                                )}
                              </div>
                              <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 text-sm">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p>No recommended actions at this time</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">Select an event to view details</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EvidenceDrawer;

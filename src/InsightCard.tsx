import { useState, useEffect, useRef } from 'react';
import type { InsightData, InsightDataL1, InsightDataL2, InsightLevel } from './insightTypes';

type InsightAnalyticsEvent = 'insight_view_l0' | 'insight_expand_l1' | 'evidence_open_l2';

type InsightAnalyticsPayload = {
  insight_id: string;
  category: string;
} & Record<string, unknown>;

interface InsightCardProps {
  data: InsightData;
  onAnalytics?: (event: InsightAnalyticsEvent, data: InsightAnalyticsPayload) => void;
  initialLevel?: InsightLevel;
  autoFocus?: boolean;
}

const InsightCard = ({ data, onAnalytics, initialLevel = 'L0', autoFocus = false }: InsightCardProps) => {
  const [level, setLevel] = useState<InsightLevel>(initialLevel);
  const [isLoadingL2, setIsLoadingL2] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  useEffect(() => {
    setLevel(initialLevel);
  }, [initialLevel]);

  useEffect(() => {
    if (!autoFocus) return;
    setLevel('L1');
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [autoFocus]);


  // Update URL when level changes
  useEffect(() => {
    if (level !== 'L0') {
      const params = new URLSearchParams(window.location.search);
      params.set('insight', data.id);
      params.set('level', level);
      window.history.replaceState({}, '', `?${params.toString()}`);
    } else {
      const params = new URLSearchParams(window.location.search);
      params.delete('insight');
      params.delete('level');
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [level, data.id]);

  // Analytics tracking
  useEffect(() => {
    if (level === 'L0') {
      onAnalytics?.('insight_view_l0', { insight_id: data.id, category: data.category });
    } else if (level === 'L1') {
      onAnalytics?.('insight_expand_l1', { insight_id: data.id, category: data.category });
    } else if (level === 'L2') {
      onAnalytics?.('evidence_open_l2', { insight_id: data.id, category: data.category });
    }
  }, [level, data.id, data.category, onAnalytics]);

  const handleCardClick = () => {
    if (level === 'L0') {
      setLevel('L1');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (level === 'L0' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setLevel('L1');
    } else if (level === 'L1' && e.key === 'Escape') {
      e.preventDefault();
      setLevel('L0');
    } else if (level === 'L2' && e.key === 'Escape') {
      e.preventDefault();
      setLevel('L1');
    }
  };

  const handleCollapseToL0 = () => {
    setLevel('L0');
  };

  const handleOpenEvidence = async () => {
    setIsLoadingL2(true);
    // Simulate lazy loading of L2 data
    // In production, this would fetch evidence_l2 from API
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsLoadingL2(false);
    setLevel('L2');
  };

  const handleCloseEvidence = () => {
    setLevel('L1');
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'churn risk':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'product feedback':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'upsell opportunity':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'support quality':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const isInteractive = level === 'L0';

  const interactiveProps = isInteractive
    ? {
        role: 'button' as const,
        tabIndex: 0,
        'aria-expanded': false,
        'aria-label': `${data.title}. Click to view details.`,
        onClick: handleCardClick,
      }
    : {};

  return (
    <>
      <article
        ref={cardRef}
        className={`
          card transition-all
          ${isInteractive ? 'card-interactive' : 'shadow-lg'}
        `}
        onKeyDown={handleKeyDown}
        {...interactiveProps}
      >
        {/* Card Header - Always Visible */}
        <CardHeader
          data={data}
          level={level}
          categoryColor={getCategoryColor(data.category)}
          onCollapse={level === 'L1' ? handleCollapseToL0 : undefined}
        />

        {/* L0: KPI Strip */}
        {level === 'L0' && <KpiStrip data={data} />}

        {/* L1: Inspect Blocks */}
        {level === 'L1' && (
          <InspectBlocks
            data={data as InsightDataL1}
            onOpenEvidence={handleOpenEvidence}
            isLoadingEvidence={isLoadingL2}
          />
        )}
      </article>

      {/* L2: Evidence Drawer */}
      {level === 'L2' && (
        <EvidenceDrawer
          data={data as InsightDataL2}
          onClose={handleCloseEvidence}
        />
      )}
    </>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CardHeaderProps {
  data: InsightData;
  level: InsightLevel;
  categoryColor: string;
  onCollapse?: () => void;
}

const CardHeader = ({ data, level, categoryColor, onCollapse }: CardHeaderProps) => {
  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Meta Row */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${categoryColor}`}>
              {data.category}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimestamp(data.timestamp)} • {data.channel}
            </span>
            {data.badge && (
              <span className="ml-auto px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-bold">
                {data.badge.label}: {data.badge.value}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">{data.title}</h3>

          {/* L0: Problem & Recommendation (2 lines each) */}
          {level === 'L0' && (
            <div className="space-y-2">
              <div>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Problem:</span>
                <p className="text-sm text-gray-800 line-clamp-2">{data.problem}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Recommendation:</span>
                <p className="text-sm text-gray-800 line-clamp-2">{data.recommendation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Collapse Button (L1 only) */}
        {level === 'L1' && onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Collapse insight"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

interface KpiStripProps {
  data: InsightData;
}

const KpiStrip = ({ data }: KpiStripProps) => {
  return (
    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-semibold text-gray-900">{data.evidence.tickets}</span>
            <span className="text-xs text-gray-600">tickets</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-semibold text-green-700">+{data.evidence.projected_improvement_pct}%</span>
            <span className="text-xs text-gray-600">projected impact</span>
          </div>
        </div>

        {/* View Details Button */}
        <button
          type="button"
          className="btn-gradient text-sm flex items-center gap-1 px-3 py-1.5"
          onClick={(e) => {
            e.stopPropagation();
            // This will be handled by the parent card click
          }}
        >
          View Details
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface InspectBlocksProps {
  data: InsightDataL1;
  onOpenEvidence: () => void;
  isLoadingEvidence: boolean;
}

const InspectBlocks = ({ data, onOpenEvidence, isLoadingEvidence }: InspectBlocksProps) => {
  return (
    <div className="p-4 space-y-4">
      {/* Full Problem & Recommendation */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Problem</h4>
          <p className="text-sm text-gray-800 leading-relaxed">{data.problem}</p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Recommendation</h4>
          <p className="text-sm text-gray-800 leading-relaxed">{data.recommendation}</p>
        </div>
      </div>

      {/* Summary Bullets */}
      <div>
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Summary</h4>
        <ul className="space-y-1.5">
          {data.summary.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Items */}
      <div>
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Recommended Actions</h4>
        <div className="space-y-2">
          {data.actions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left btn-gradient-success rounded-lg p-3 transition-all group text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{action}</span>
                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Linked Tickets Table */}
      <div>
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Linked Tickets ({data.linked_tickets.length})</h4>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">ID</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Sentiment</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Agent</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.linked_tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs text-blue-600">{ticket.id}</td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    {new Date(ticket.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      ticket.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      ticket.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.sentiment}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">{ticket.agent}</td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    {ticket.duration_sec < 60 ? `${ticket.duration_sec}s` : `${Math.floor(ticket.duration_sec / 60)}m`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projected Impact */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">Projected Impact</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-blue-700">KPI</span>
            <p className="text-sm font-bold text-blue-900">{data.impact.kpi}</p>
          </div>
          <div>
            <span className="text-xs text-blue-700">Delta</span>
            <p className="text-sm font-bold text-blue-900">{data.impact.delta_pct > 0 ? '+' : ''}{data.impact.delta_pct}%</p>
          </div>
          <div>
            <span className="text-xs text-blue-700">Window</span>
            <p className="text-sm font-bold text-blue-900">{data.impact.window_days} days</p>
          </div>
          <div>
            <span className="text-xs text-blue-700">Scope</span>
            <p className="text-sm font-bold text-blue-900">{data.impact.scope}</p>
          </div>
        </div>
      </div>

      {/* See Evidence Link */}
      <div className="pt-3 border-t border-gray-200">
        <button
          type="button"
          onClick={onOpenEvidence}
          disabled={isLoadingEvidence}
          className="w-full btn-gradient flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoadingEvidence ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading Evidence...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              See Evidence
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface EvidenceDrawerProps {
  data: InsightDataL2;
  onClose: () => void;
}

const EvidenceDrawer = ({ data, onClose }: EvidenceDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap: focus first focusable element when drawer opens
  useEffect(() => {
    const firstButton = drawerRef.current?.querySelector('button');
    firstButton?.focus();
  }, []);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-2xl z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-drawer-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 gradient-header px-6 py-4 flex items-center justify-between">
          <h2 id="evidence-drawer-title" className="text-lg font-bold text-white">Evidence</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-glass p-2"
            aria-label="Close evidence drawer"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transcript Spans */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Transcript Evidence</h3>
            <div className="space-y-3">
              {data.evidence_l2.spans.map((span, idx) => (
                <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-600">Ticket {span.ticket_id}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-600">{span.startSec}s - {span.endSec}s</span>
                  </div>
                  <p className="text-sm text-gray-800 italic">"{span.text}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Record */}
          {data.evidence_l2.audio && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Audio Recording</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <audio controls className="w-full" src={data.evidence_l2.audio.url}>
                  Your browser does not support the audio element.
                </audio>
                <p className="text-xs text-gray-600 mt-2">
                  Duration: {Math.floor(data.evidence_l2.audio.duration_sec / 60)}m {data.evidence_l2.audio.duration_sec % 60}s
                </p>
              </div>
            </div>
          )}

          {/* Provenance */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Data Provenance</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Metric</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Source</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.evidence_l2.provenance.map((prov, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs font-medium text-gray-900">{prov.metric}</td>
                      <td className="px-3 py-2 text-xs text-gray-700">{prov.source}</td>
                      <td className="px-3 py-2 text-xs text-gray-700">{prov.window}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Calculations</h3>
            <div className="space-y-2">
              {data.evidence_l2.calculations.map((calc, idx) => (
                <div key={idx} className="bg-blue-50 rounded p-3 border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-blue-900">{calc.name}</span>
                    <span className="text-sm font-bold text-blue-700">{calc.value}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <span>Method: {calc.method}</span>
                    <span>•</span>
                    <span>Window: {calc.window}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Records */}
          {data.evidence_l2.related_records.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Related Records</h3>
              <div className="space-y-2">
                {data.evidence_l2.related_records.map((record, idx) => (
                  <a
                    key={idx}
                    href={record.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded p-3 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{record.system} - {record.object}</p>
                        <p className="text-xs text-gray-600 font-mono">{record.record_id}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InsightCard;

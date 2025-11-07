import { useEffect, useMemo, useState } from 'react';
import InsightCard from './InsightCard';
import type { InsightDataL2 } from './insightTypes';
import { demoInsights } from './demoInsights';

interface InsightsViewProps {
  onBack: () => void;
  initialInsightId?: string | null;
}

const InsightsView = ({ onBack, initialInsightId }: InsightsViewProps) => {
  const [filter, setFilter] = useState<string>('all');
  const [focusedInsightId, setFocusedInsightId] = useState<string | null>(initialInsightId ?? null);

  const filteredInsights = useMemo<InsightDataL2[]>(() => {
    if (filter === 'all') {
      return demoInsights;
    }

    const normalizedFilter = filter.toLowerCase();
    return demoInsights.filter((insight) =>
      insight.category.toLowerCase().replace(/\s+/g, '-') === normalizedFilter
    );
  }, [filter]);

  const handleAnalytics = (event: string, data: Record<string, unknown>) => {
    console.log('Analytics event:', event, data);
  };

  useEffect(() => {
    if (!initialInsightId) return;
    const targetInsight = demoInsights.find((insight) => insight.id === initialInsightId);
    if (!targetInsight) return;

    const normalizedCategory = targetInsight.category.toLowerCase().replace(/\s+/g, '-');
    setFilter((current) => (current === normalizedCategory ? current : normalizedCategory));
    setFocusedInsightId(initialInsightId);
  }, [initialInsightId]);

  useEffect(() => {
    if (!focusedInsightId) return;
    const timeout = window.setTimeout(() => setFocusedInsightId(null), 1500);
    return () => window.clearTimeout(timeout);
  }, [focusedInsightId]);

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
                <h1 className="text-2xl font-bold text-white">Insights</h1>
                <p className="text-sm text-white/90">Actionable intelligence from customer interactions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="metric-card">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/20">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{filteredInsights.length}</div>
                  <div className="text-xs text-white/80">Insights</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Filters */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-4">
        <div className="tab-nav">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          >
            All Insights
          </button>
          <button
            type="button"
            onClick={() => setFilter('churn-risk')}
            className={`tab-btn ${filter === 'churn-risk' ? 'active' : ''}`}
          >
            Churn Risk
          </button>
          <button
            type="button"
            onClick={() => setFilter('product-feedback')}
            className={`tab-btn ${filter === 'product-feedback' ? 'active' : ''}`}
          >
            Product Feedback
          </button>
          <button
            type="button"
            onClick={() => setFilter('upsell-opportunity')}
            className={`tab-btn ${filter === 'upsell-opportunity' ? 'active' : ''}`}
          >
            Upsell Opportunity
          </button>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-4">
          {filteredInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              data={insight}
              onAnalytics={handleAnalytics}
              initialLevel={focusedInsightId === insight.id ? 'L1' : 'L0'}
              autoFocus={focusedInsightId === insight.id}
            />
          ))}
        </div>

        {filteredInsights.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm font-medium">No insights found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="max-w-7xl mx-auto px-6 py-4 text-center">
        <p className="text-xs text-gray-500">
          <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs">Click</kbd> to expand insights •
          <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs ml-2">Esc</kbd> to collapse •
          <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs ml-2">Enter/Space</kbd> keyboard navigation
        </p>
      </div>
    </div>
  );
};

export default InsightsView;

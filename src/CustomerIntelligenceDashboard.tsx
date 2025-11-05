import { useState, useMemo, useRef } from 'react';
import type { Customer, DashboardMetrics } from './types';
import { generateDemoCustomers } from './demoDataEnhanced';
import { getHealthScoreColor, formatCurrency } from './utils';

export default function CustomerIntelligenceDashboard() {
  const [customers] = useState<Customer[]>(generateDemoCustomers());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate dashboard metrics
  const metrics = useMemo<DashboardMetrics>(() => {
    const atRiskCount = customers.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length;
    const totalMRR = customers.reduce((sum, c) => sum + c.mrr, 0);
    const avgHealthScore = Math.round(
      customers.reduce((sum, c) => sum + c.healthScore, 0) / customers.length
    );
    const activeOpportunities = customers.reduce((count, c) => {
      return count + c.interactions.filter(i => i.tags.includes('opportunity') || i.tags.includes('upsell')).length;
    }, 0);

    return {
      totalCustomers: customers.length,
      atRiskCount,
      totalMRR,
      avgHealthScore,
      activeOpportunities,
    };
  }, [customers]);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.stage.toLowerCase().includes(query) ||
      c.assignedTo.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  // Sort: at-risk first, then by health score
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      // Critical/High risk first
      if ((a.riskLevel === 'critical' || a.riskLevel === 'high') && 
          (b.riskLevel !== 'critical' && b.riskLevel !== 'high')) return -1;
      if ((b.riskLevel === 'critical' || b.riskLevel === 'high') && 
          (a.riskLevel !== 'critical' && a.riskLevel !== 'high')) return 1;
      
      // Then by health score (lowest first)
      return a.healthScore - b.healthScore;
    });
  }, [filteredCustomers]);

  const selectedCustomer = selectedCustomerId 
    ? customers.find(c => c.id === selectedCustomerId)
    : null;

  if (selectedCustomer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <CustomerJourneyView 
          customer={selectedCustomer}
          onBack={() => setSelectedCustomerId(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">VIA - Customer Journey Intelligence</h1>
              <p className="text-lg text-blue-100">Real-time customer health & engagement monitoring</p>
            </div>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg">
              📊 Export Report
            </button>
          </div>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            label="At Risk Customers"
            value={metrics.atRiskCount}
            subtitle={`/ ${metrics.totalCustomers} total`}
            color="red"
          />
          <KPICard
            label="Total MRR"
            value={formatCurrency(metrics.totalMRR)}
            color="default"
          />
          <KPICard
            label="Avg Health Score"
            value={metrics.avgHealthScore}
            color="green"
          />
          <KPICard
            label="Active Opportunities"
            value={metrics.activeOpportunities}
            color="blue"
          />
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Customer Portfolio</h2>
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Health
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    MRR
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Risk
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedCustomers.map(customer => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.assignedTo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      {customer.stage.replace('-', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: getHealthScoreColor(customer.healthScore) }}
                      >
                        {customer.healthScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.mrr > 0 ? `${formatCurrency(customer.mrr)}/mo` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.lastContactDays === 0 ? 'Today' : `${customer.lastContactDays} days ago`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RiskBadge level={customer.riskLevel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ 
  label, 
  value, 
  subtitle, 
  color = 'default' 
}: { 
  label: string; 
  value: string | number; 
  subtitle?: string;
  color?: 'red' | 'green' | 'blue' | 'default';
}) {
  const colorClasses = {
    red: 'text-red-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    default: 'text-gray-900',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className={`text-4xl font-extrabold ${colorClasses[color]}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const styles = {
    low: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
  };

  const labels = {
    low: 'Low Risk',
    medium: 'Medium',
    high: 'High Risk',
    critical: 'Critical',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[level as keyof typeof styles]}`}>
      {labels[level as keyof typeof labels]}
    </span>
  );
}


function CustomerJourneyView({ customer, onBack }: { customer: Customer; onBack: () => void }) {
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(
    new Set(['call', 'email', 'meeting', 'support', 'product-usage', 'billing'])
  );
  const [enabledSentiments, setEnabledSentiments] = useState<Set<string>>(
    new Set(['very-positive', 'positive', 'neutral', 'negative', 'very-negative'])
  );

  const toggleType = (type: string) => {
    setEnabledTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const toggleSentiment = (sentiment: string) => {
    setEnabledSentiments(prev => {
      const next = new Set(prev);
      if (next.has(sentiment)) {
        next.delete(sentiment);
      } else {
        next.add(sentiment);
      }
      return next;
    });
  };
  const selectedInteraction = selectedInteractionId
    ? customer.interactions.find(i => i.id === selectedInteractionId)
    : null;

  // Sort interactions by date
  const sortedInteractions = useMemo(() => {
    return [...customer.interactions].sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    );
  }, [customer.interactions]);

  // Filter interactions
  const filteredInteractions = useMemo(() => {
    return sortedInteractions.filter(interaction => {
      if (!enabledTypes.has(interaction.type)) return false;
      if (!enabledSentiments.has(interaction.sentiment)) return false;
      return true;
    });
  }, [sortedInteractions, enabledTypes, enabledSentiments]);

  // Group interactions by lifecycle stage
  // Note: This grouping is prepared for future use (e.g., VerticalTimeline component)
  // const groupedByStage = useMemo(() => {
  //   const groups: Record<string, typeof filteredInteractions> = {};
  //   filteredInteractions.forEach(interaction => {
  //     if (!groups[interaction.stage]) {
  //       groups[interaction.stage] = [];
  //     }
  //     groups[interaction.stage].push(interaction);
  //   });
  //   return groups;
  // }, [filteredInteractions]);

  // Calculate health trend data points
  const healthTrend = useMemo(() => {
    const points: Array<{ date: Date; score: number; sentiment: string }> = [];
    sortedInteractions.forEach((interaction, index) => {
      // Simulate health score changes based on sentiment and tags
      let scoreChange = 0;
      if (interaction.sentiment === 'very-positive') scoreChange = 5;
      else if (interaction.sentiment === 'positive') scoreChange = 3;
      else if (interaction.sentiment === 'negative') scoreChange = -3;
      else if (interaction.sentiment === 'very-negative') scoreChange = -8;

      if (interaction.tags.includes('success')) scoreChange += 5;
      if (interaction.tags.includes('risk')) scoreChange -= 10;
      if (interaction.tags.includes('churn-signal')) scoreChange -= 15;

      const previousScore = index === 0 ? 75 : points[index - 1].score;
      const newScore = Math.max(0, Math.min(100, previousScore + scoreChange));

      points.push({
        date: interaction.timestamp,
        score: newScore,
        sentiment: interaction.sentiment,
      });
    });
    return points;
  }, [sortedInteractions]);

  // Calculate the largest engagement gap for Hero Card
  const largestGap = useMemo(() => {
    if (sortedInteractions.length === 0) return 0;
    let maxGap = customer.lastContactDays; // Days since last contact

    // Check gaps between interactions
    for (let i = 0; i < sortedInteractions.length - 1; i++) {
      const gapDays = Math.floor(
        (sortedInteractions[i + 1].timestamp.getTime() - sortedInteractions[i].timestamp.getTime()) /
        (1000 * 60 * 60 * 24)
      );
      if (gapDays > maxGap) maxGap = gapDays;
    }

    return maxGap;
  }, [sortedInteractions, customer.lastContactDays]);

  const handleInteractionClick = (id: string) => {
    setSelectedInteractionId(id);
  };

  const closeDrawer = () => {
    setSelectedInteractionId(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Minimal Sticky Header - View Toggle Only */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Customer Journey View
            </div>
            <div className="flex items-center gap-0.5 bg-neutral-100/80 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                📊 Timeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                📋 List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Layer 1: Hero Card - Progressive Disclosure "So What?" */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-baseline gap-6">
                {/* Massive Health Score - The Focal Point */}
                <div
                  className="text-8xl font-black tracking-tight"
                  style={{ color: getHealthScoreColor(customer.healthScore) }}
                >
                  {customer.healthScore}
                </div>
                <div className="flex flex-col gap-2">
                  {/* State - Connected to Score */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-neutral-900 capitalize">
                      {customer.riskLevel} Risk
                    </span>
                    <RiskBadge level={customer.riskLevel} />
                  </div>
                  {/* Reason - The "Why" */}
                  <div className="text-base text-neutral-600">
                    <span className="font-semibold">{largestGap}d</span> max engagement gap
                    {customer.lastContactDays > 7 && (
                      <span className="text-red-600 font-semibold ml-2">
                        · {customer.lastContactDays}d since last contact
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="flex items-center gap-6 text-sm text-neutral-600">
                  <span>
                    <span className="font-semibold text-neutral-900">{customer.name}</span>
                  </span>
                  <span>·</span>
                  <span className="capitalize">{customer.stage.replace('-', ' ')}</span>
                  <span>·</span>
                  <span>{formatCurrency(customer.mrr)}/mo</span>
                  <span>·</span>
                  <span>{customer.tenure}m tenure</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-8">
              <button
                onClick={onBack}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors text-sm font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Layer 3: Refined Filters Bar (with custom toggle switches) */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <div className="space-y-5">
            {/* Type Filters */}
            <div>
              <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-3">Interaction Types</div>
              <div className="flex flex-wrap items-center gap-3">
                {['call', 'email', 'meeting', 'support', 'product-usage', 'billing'].map(type => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className="flex items-center gap-2 group"
                  >
                    {/* Custom Toggle Switch */}
                    <div
                      className={`relative w-10 h-6 rounded-full transition-all duration-200 ${
                        enabledTypes.has(type)
                          ? 'bg-blue-600'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                          enabledTypes.has(type) ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                      enabledTypes.has(type) ? 'text-neutral-900' : 'text-neutral-500'
                    }`}>
                      {getInteractionIcon(type)} {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-200"></div>

            {/* Sentiment Filters */}
            <div>
              <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-3">Sentiment</div>
              <div className="flex flex-wrap items-center gap-3">
                {(['very-positive', 'positive', 'neutral', 'negative', 'very-negative'] as const).map(sentiment => (
                  <button
                    key={sentiment}
                    onClick={() => toggleSentiment(sentiment)}
                    className="flex items-center gap-2 group"
                  >
                    {/* Custom Toggle Switch */}
                    <div
                      className={`relative w-10 h-6 rounded-full transition-all duration-200 ${
                        enabledSentiments.has(sentiment)
                          ? 'bg-emerald-600'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                          enabledSentiments.has(sentiment) ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                      enabledSentiments.has(sentiment) ? 'text-neutral-900' : 'text-neutral-500'
                    }`}>
                      {getSentimentEmoji(sentiment)} {sentiment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">
                  Showing <span className="font-bold text-neutral-900">{filteredInteractions.length}</span> of <span className="font-semibold text-neutral-700">{sortedInteractions.length}</span> interactions
                </span>
                <button
                  onClick={() => {
                    setEnabledTypes(new Set(['call', 'email', 'meeting', 'support', 'product-usage', 'billing']));
                    setEnabledSentiments(new Set(['very-positive', 'positive', 'neutral', 'negative', 'very-negative']));
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Elegant Overview */}
        <div className="bg-white rounded-xl border border-neutral-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 tracking-tight">Journey Overview</h2>
              <p className="text-sm text-neutral-500 mt-1">
                {customer.interactions.length} touchpoints · {customer.tenure} month relationship
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-5 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-2xl font-semibold text-neutral-900">
                  {sortedInteractions.filter(i => i.sentiment === 'very-positive' || i.sentiment === 'positive').length}
                </div>
                <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide mt-1">Positive</div>
              </div>
              <div className="text-center px-5 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-2xl font-semibold text-red-600">
                  {sortedInteractions.filter(i => i.tags.some(t => ['risk', 'complaint', 'churn-signal'].includes(t))).length}
                </div>
                <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide mt-1">Risk</div>
              </div>
              <div className="text-center px-5 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-2xl font-semibold text-emerald-600">
                  {sortedInteractions.filter(i => i.tags.some(t => ['opportunity', 'upsell', 'success'].includes(t))).length}
                </div>
                <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide mt-1">Opportunity</div>
              </div>
            </div>
          </div>

          {/* Health Trend Visualization */}
          <HealthTrendChart healthTrend={healthTrend} />
        </div>

        {/* Conditional View based on viewMode */}
        {viewMode === 'timeline' ? (
          <AdvancedTimelineChart
            interactions={filteredInteractions}
            onInteractionClick={handleInteractionClick}
            selectedId={selectedInteractionId}
          />
        ) : (
          <InteractionListView
            interactions={filteredInteractions}
            onInteractionClick={handleInteractionClick}
            selectedId={selectedInteractionId}
          />
        )}
      </div>

      {/* Enhanced Evidence Panel Drawer */}
      {selectedInteraction && (
        <EnhancedEvidenceDrawer
          customer={customer}
          interaction={selectedInteraction}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
}

// Health Trend Chart Component
function HealthTrendChart({ healthTrend }: { healthTrend: Array<{ date: Date; score: number; sentiment: string }> }) {
  if (healthTrend.length === 0) return null;

  const maxScore = 100;
  const minScore = 0;

  return (
    <div className="relative pt-2">
      <div className="flex items-end justify-between h-24 gap-0.5">
        {healthTrend.map((point, index) => {
          const heightPercent = ((point.score - minScore) / (maxScore - minScore)) * 100;
          const isFirst = index === 0;
          const isLast = index === healthTrend.length - 1;

          let barColor = 'bg-neutral-300';
          if (point.score >= 80) barColor = 'bg-emerald-500';
          else if (point.score >= 60) barColor = 'bg-neutral-400';
          else if (point.score >= 40) barColor = 'bg-amber-500';
          else barColor = 'bg-red-500';

          return (
            <div key={index} className="flex-1 flex flex-col items-center group relative">
              <div
                className={`w-full ${barColor} rounded-t transition-all hover:opacity-70 cursor-pointer`}
                style={{ height: `${heightPercent}%` }}
                title={`${point.date.toLocaleDateString()}: Score ${point.score}`}
              >
                {(isFirst || isLast || point.score < 50) && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-neutral-900">
                    {point.score}
                  </div>
                )}
              </div>
              {(isFirst || isLast) && (
                <div className="text-[10px] text-neutral-500 mt-2 whitespace-nowrap uppercase tracking-wide">
                  {point.date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-200">
        <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide">Health Score Trend</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-[10px] text-neutral-600 font-medium">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-[10px] text-neutral-600 font-medium">At Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-[10px] text-neutral-600 font-medium">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Advanced Timeline Chart Component with Zoom & Pan (Direct Manipulation)
function AdvancedTimelineChart({
  interactions,
  onInteractionClick,
  selectedId,
}: {
  interactions: Array<{
    id: string;
    timestamp: Date;
    type: string;
    title: string;
    summary: string;
    sentiment: string;
    tags: string[];
    stage: string;
  }>;
  onInteractionClick: (id: string) => void;
  selectedId: string | null;
}) {
  const [zoom, setZoom] = useState(1); // Zoom level (1 = 100%, 2 = 200%, etc.)
  const [panOffset, setPanOffset] = useState(0); // Pan offset in pixels
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; offset: number } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  if (interactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-20 text-center">
        <div className="text-neutral-400 text-sm font-medium">No interactions match the current filters</div>
      </div>
    );
  }

  const firstDate = interactions[0].timestamp.getTime();
  const lastDate = Math.max(...interactions.map(i => i.timestamp.getTime()), Date.now());
  const totalDuration = lastDate - firstDate;

  const getPosition = (timestamp: Date) => {
    if (totalDuration === 0) return 0;
    return ((timestamp.getTime() - firstDate) / totalDuration) * 100;
  };

  // Zoom handler - anchored to mouse pointer
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const oldZoom = zoom;
    const newZoom = Math.max(0.5, Math.min(5, oldZoom + (e.deltaY < 0 ? 0.1 : -0.1)));

    // Calculate new pan offset to keep mouse position anchored
    const zoomRatio = newZoom / oldZoom;
    const newPanOffset = mouseX - (mouseX - panOffset) * zoomRatio;

    setZoom(newZoom);
    setPanOffset(newPanOffset);
  };

  // Pan handlers - click & drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsPanning(true);
    setPanStart({ x: e.clientX, offset: panOffset });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStart) return;
    const delta = e.clientX - panStart.x;
    setPanOffset(panStart.offset + delta);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setPanStart(null);
  };

  const handleMouseLeave = () => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
    }
  };

  // Detect significant gaps
  const gaps: Array<{ start: number; end: number; days: number }> = [];
  for (let i = 0; i < interactions.length - 1; i++) {
    const gapDays = Math.floor((interactions[i + 1].timestamp.getTime() - interactions[i].timestamp.getTime()) / (1000 * 60 * 60 * 24));
    if (gapDays > 14) {
      gaps.push({
        start: getPosition(interactions[i].timestamp),
        end: getPosition(interactions[i + 1].timestamp),
        days: gapDays,
      });
    }
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Timeline Header with Zoom Controls */}
      <div className="px-8 py-5 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">Interactive Timeline</h3>
            <p className="text-xs text-neutral-500 mt-0.5">{interactions.length} interactions · {Math.floor(totalDuration / (1000 * 60 * 60 * 24))} days</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500">
              🖱️ Scroll to zoom · Drag to pan · Zoom: {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => { setZoom(1); setPanOffset(0); }}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Reset View
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Canvas with Zoom & Pan */}
      <div
        ref={timelineRef}
        className="relative bg-white p-12 min-h-[450px] overflow-hidden"
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Transformed Timeline Content */}
        <div
          style={{
            transform: `scaleX(${zoom}) translateX(${panOffset}px)`,
            transformOrigin: 'left center',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {/* Base Timeline Line */}
          <div className="absolute top-1/2 left-16 right-16 h-px bg-neutral-200 transform -translate-y-1/2" style={{ zIndex: 2 }}></div>

          {/* Gap Indicators */}
          {gaps.map((gap, idx) => (
          <div
            key={idx}
            className="absolute top-1/4 bottom-1/4 bg-red-50/50 border border-dashed border-red-200 rounded"
            style={{
              left: `calc(4rem + (100% - 8rem) * ${gap.start / 100})`,
              right: `calc(4rem + (100% - 8rem) * ${(100 - gap.end) / 100})`,
              zIndex: 3,
            }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap">
              {gap.days}d gap
            </div>
          </div>
        ))}

        {/* Interaction Nodes */}
        {interactions.map((interaction, index) => {
          const position = getPosition(interaction.timestamp);
          const isSelected = selectedId === interaction.id;
          const hasRisk = interaction.tags.some(t => ['risk', 'complaint', 'churn-signal'].includes(t));
          const hasOpportunity = interaction.tags.some(t => ['opportunity', 'upsell', 'success'].includes(t));
          const isChampion = interaction.tags.includes('champion');

          let nodeColor = 'bg-neutral-900 border-neutral-900 text-white';

          if (hasRisk) {
            nodeColor = 'bg-red-600 border-red-600 text-white';
          } else if (hasOpportunity) {
            nodeColor = 'bg-emerald-600 border-emerald-600 text-white';
          }

          const isAbove = index % 2 === 0;

          return (
            <div
              key={interaction.id}
              className="absolute group"
              style={{
                left: `calc(4rem + (100% - 8rem) * ${position / 100})`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 20 : 10,
              }}
            >
              {/* Connecting Line to Timeline */}
              <div
                className={`absolute left-1/2 w-px bg-neutral-200 ${isAbove ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                style={{ height: '70px' }}
              />

              {/* Interactive Node */}
              <button
                type="button"
                onClick={() => onInteractionClick(interaction.id)}
                className={`relative ${nodeColor} ${
                  isSelected ? 'w-11 h-11 ring-4 ring-neutral-900/20' : 'w-9 h-9'
                } rounded-full border-2 transition-all duration-200 hover:scale-110 flex items-center justify-center text-base ${
                  hasRisk ? 'animate-pulse' : ''
                }`}
                title={interaction.title}
              >
                {getInteractionIcon(interaction.type)}
                {isChampion && (
                  <span className="absolute -top-1 -right-1 text-xs">👑</span>
                )}
              </button>

              {/* Hover Card */}
              <div
                className={`absolute ${isAbove ? 'bottom-full mb-20' : 'top-full mt-20'} left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30`}
              >
                <div className="bg-white rounded-lg shadow-xl border border-neutral-200 p-4 min-w-[280px] max-w-[320px]">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{getInteractionIcon(interaction.type)}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1 text-neutral-900">{interaction.title}</div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wide">
                        {interaction.timestamp.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-600 line-clamp-2 mb-3 leading-relaxed">{interaction.summary}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {interaction.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

          {/* Date Labels */}
          <div className="absolute bottom-6 left-16 text-[10px] font-medium text-neutral-500 uppercase tracking-wide">
            {new Date(firstDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="absolute bottom-6 right-16 text-[10px] font-medium text-neutral-500 uppercase tracking-wide">
            Today
          </div>
        </div>
        {/* End Transformed Content */}
      </div>
    </div>
  );
}

// Interaction List View Component
function InteractionListView({
  interactions,
  onInteractionClick,
  selectedId,
}: {
  interactions: Array<{
    id: string;
    timestamp: Date;
    type: string;
    title: string;
    summary: string;
    sentiment: string;
    tags: string[];
    stage: string;
  }>;
  onInteractionClick: (id: string) => void;
  selectedId: string | null;
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="divide-y divide-neutral-100">
        {interactions.map((interaction) => {
          const hasRisk = interaction.tags.some((t: string) => ['risk', 'complaint', 'churn-signal'].includes(t));
          const hasOpportunity = interaction.tags.some((t: string) => ['opportunity', 'upsell', 'success'].includes(t));
          const isChampion = interaction.tags.includes('champion');
          const isSelected = selectedId === interaction.id;

          let borderColor = 'border-transparent';
          let bgColor = isSelected ? 'bg-neutral-50' : 'bg-white hover:bg-neutral-50/50';

          if (hasRisk) {
            bgColor = isSelected ? 'bg-red-50' : 'bg-white hover:bg-red-50/50';
            borderColor = 'border-red-500';
          } else if (hasOpportunity) {
            bgColor = isSelected ? 'bg-emerald-50' : 'bg-white hover:bg-emerald-50/50';
            borderColor = 'border-emerald-500';
          }

          return (
            <button
              key={interaction.id}
              type="button"
              onClick={() => onInteractionClick(interaction.id)}
              className={`w-full text-left px-8 py-5 transition-all border-l-2 ${borderColor} ${bgColor} ${
                isSelected ? 'ring-1 ring-inset ring-neutral-900/10' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-2xl flex-shrink-0">{getInteractionIcon(interaction.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="font-semibold text-sm text-neutral-900">{interaction.title}</h4>
                      {isChampion && <span className="text-base">👑</span>}
                    </div>
                    <p className="text-sm text-neutral-600 mb-2 line-clamp-2 leading-relaxed">{interaction.summary}</p>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span>{interaction.timestamp.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}</span>
                      <span>·</span>
                      <span className="capitalize">{interaction.stage.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-3">
                  <div className="flex flex-wrap gap-1.5 justify-end max-w-xs">
                    {interaction.tags.slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-md text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getSentimentBadgeColor(interaction.sentiment)}`}>
                      {getSentimentEmoji(interaction.sentiment)}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-neutral-400 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Interaction Card Component
// Enhanced Evidence Drawer Component with Collapsible Sections
function EnhancedEvidenceDrawer({
  customer,
  interaction,
  onClose
}: {
  customer: Customer;
  interaction: {
    id: string;
    timestamp: Date;
    type: string;
    title: string;
    summary: string;
    sentiment: string;
    tags: string[];
    duration?: number;
    participants: string[];
    transcript?: string;
    aiInsights?: Array<{ id: string; icon?: string; title: string; description: string }>;
    recommendedActions?: Array<{ id: string; title: string }>;
  };
  onClose: () => void;
}) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    customer: true,
    flags: true,
    details: true,
    transcript: false,
    insights: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasAudio = interaction.type === 'call' && interaction.transcript;

  // Determine sentiment display
  const getSentimentDisplay = () => {
    const hasRisk = interaction.tags.some(t => ['risk', 'complaint', 'churn-signal'].includes(t));
    const hasOpportunity = interaction.tags.some(t => ['opportunity', 'upsell', 'success'].includes(t));

    if (hasRisk) return { label: 'Risk', colorClass: 'bg-red-100 text-red-800 border border-red-300' };
    if (hasOpportunity) return { label: 'Opportunity', colorClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300' };
    if (interaction.sentiment === 'very-positive' || interaction.sentiment === 'positive') return { label: 'Positive', colorClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300' };
    if (interaction.sentiment === 'very-negative' || interaction.sentiment === 'negative') return { label: 'Risk', colorClass: 'bg-red-100 text-red-800 border border-red-300' };
    return { label: 'Neutral', colorClass: 'bg-neutral-100 text-neutral-800 border border-neutral-300' };
  };

  const sentiment = getSentimentDisplay();

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 w-[420px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-5 py-5 border-b border-neutral-200 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <span className="text-lg">{getInteractionIcon(interaction.type)}</span>
            Evidence & Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-900 hover:text-neutral-900 transition-all"
            aria-label="Close evidence panel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Scrollable Sections */}
        <div className="flex-1 overflow-y-auto">
          {/* Overview Section */}
          <CollapsibleSection
            title="Interaction Overview"
            isExpanded={expandedSections.overview}
            onToggle={() => toggleSection('overview')}
          >
            <div className="space-y-4">
              {/* Title and Type */}
              <div>
                <h3 className="font-semibold text-neutral-900 text-base mb-2">{interaction.title}</h3>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-neutral-600 capitalize">{interaction.type.replace('-', ' ')}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${sentiment.colorClass}`}>
                    {sentiment.label}
                  </span>
                </div>
              </div>

              {/* Date/Time */}
              <div className="text-sm text-neutral-600">
                {interaction.timestamp.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>

              {/* Summary */}
              <div className="pt-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-700 leading-relaxed">{interaction.summary}</p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Customer Information Section */}
          <CollapsibleSection
            title="Client Information"
            isExpanded={expandedSections.customer}
            onToggle={() => toggleSection('customer')}
          >
            <div className="space-y-3">
              <DetailRow label="Account Name" value={customer.name} />
              <DetailRow label="Account Tier" value={<span className="capitalize font-semibold text-neutral-900">{customer.tier}</span>} />
              <DetailRow label="Stage" value={<span className="capitalize">{customer.stage.replace('-', ' ')}</span>} />
              <DetailRow label="Health Score" value={
                <span className="font-bold text-lg" style={{ color: getHealthScoreColor(customer.healthScore) }}>
                  {customer.healthScore}
                </span>
              } />
              <DetailRow label="MRR" value={<span className="font-semibold">{formatCurrency(customer.mrr)}</span>} />
              <DetailRow label="Tenure" value={`${customer.tenure} months`} />
              <DetailRow label="Risk Level" value={<RiskBadge level={customer.riskLevel} />} />
              <DetailRow label="Assigned To" value={customer.assignedTo} />
            </div>
          </CollapsibleSection>

          {/* Flags Section */}
          {interaction.tags.length > 0 && (
            <CollapsibleSection
              title="Flags & Tags"
              isExpanded={expandedSections.flags}
              onToggle={() => toggleSection('flags')}
            >
              <div className="flex flex-wrap gap-2">
                {interaction.tags.map((tag: string) => {
                  const isRisk = ['risk', 'complaint', 'churn-signal'].includes(tag);
                  const isOpportunity = ['opportunity', 'upsell', 'success'].includes(tag);
                  return (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        isRisk ? 'bg-red-50 text-red-800 border-red-300' :
                        isOpportunity ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        'bg-neutral-100 text-neutral-800 border-neutral-300'
                      }`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* Interaction Details Section */}
          {(interaction.duration || interaction.participants.length > 0) && (
            <CollapsibleSection
              title="Interaction Details"
              isExpanded={expandedSections.details}
              onToggle={() => toggleSection('details')}
            >
              <div className="space-y-3">
                {interaction.duration && <DetailRow label="Duration" value={`${interaction.duration} min`} />}
                {interaction.participants.length > 0 && (
                  <DetailRow
                    label="Participants"
                    value={
                      <div className="space-y-1">
                        {interaction.participants.map((p: string, i: number) => (
                          <div key={i} className="text-sm text-neutral-900">{p}</div>
                        ))}
                      </div>
                    }
                  />
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Transcript Section */}
          {interaction.transcript && (
            <CollapsibleSection
              title="Full Transcript & Audio"
              isExpanded={expandedSections.transcript}
              onToggle={() => toggleSection('transcript')}
            >
              {hasAudio && (
                <div className="mb-4">
                  <div className="bg-neutral-900 rounded-lg p-4 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-lg">
                        🎧
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Call Recording</div>
                        <div className="text-xs text-neutral-400">{interaction.duration} min</div>
                      </div>
                    </div>
                    <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
                      <div className="absolute inset-y-0 left-0 w-1/3 bg-neutral-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button type="button" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                          ⏮️
                        </button>
                        <button type="button" className="w-10 h-10 bg-neutral-600 hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors">
                          ▶️
                        </button>
                        <button type="button" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                          ⏭️
                        </button>
                      </div>
                      <span className="text-neutral-400">2:34 / {interaction.duration}:00</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <div className="font-mono text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                  {interaction.transcript}
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* AI Insights Section */}
          {interaction.aiInsights && interaction.aiInsights.length > 0 && (
            <CollapsibleSection
              title={`AI Insights (${interaction.aiInsights.length})`}
              isExpanded={expandedSections.insights}
              onToggle={() => toggleSection('insights')}
            >
              <div className="space-y-3">
                {interaction.aiInsights.map((insight) => (
                  <div key={insight.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      {insight.icon && <span className="text-lg flex-shrink-0">{insight.icon}</span>}
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-neutral-900 mb-1">{insight.title}</div>
                        <div className="text-xs text-neutral-700 leading-relaxed">{insight.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Recommended Actions Section */}
          {interaction.recommendedActions && interaction.recommendedActions.length > 0 && (
            <CollapsibleSection
              title={`Recommended Actions (${interaction.recommendedActions.length})`}
              isExpanded={true}
              onToggle={() => {}}
            >
              <div className="space-y-2">
                {interaction.recommendedActions.map((action, index: number) => (
                  <button
                    key={action.id}
                    type="button"
                    className="w-full text-left bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span>{action.title}</span>
                    </div>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      </div>
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  isExpanded,
  onToggle,
  children
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-neutral-200">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left bg-neutral-50 hover:bg-neutral-100 transition-colors"
      >
        <span className="text-xs font-bold text-neutral-600 uppercase tracking-wide">{title}</span>
        <svg
          className={`w-4 h-4 text-neutral-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-5 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Detail Row Component
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-3 py-2 border-b border-neutral-100 last:border-b-0">
      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide flex-shrink-0">{label}</span>
      <span className="text-sm text-neutral-900 text-right">{value}</span>
    </div>
  );
}

function getInteractionIcon(type: string): string {
  const icons: Record<string, string> = {
    call: '📞',
    email: '✉️',
    meeting: '👥',
    support: '🛠️',
    'product-usage': '📱',
    billing: '💳',
  };
  return icons[type] || '📋';
}

function getSentimentEmoji(sentiment: string): string {
  const emojis: Record<string, string> = {
    'very-positive': '😊',
    'positive': '🙂',
    'neutral': '😐',
    'negative': '😟',
    'very-negative': '😤',
  };
  return emojis[sentiment] || '😐';
}

function getSentimentBadgeColor(sentiment: string): string {
  const colors: Record<string, string> = {
    'very-positive': 'bg-green-100 text-green-800 border border-green-300',
    'positive': 'bg-green-50 text-green-700 border border-green-200',
    'neutral': 'bg-gray-100 text-gray-700 border border-gray-300',
    'negative': 'bg-orange-50 text-orange-700 border border-orange-200',
    'very-negative': 'bg-red-100 text-red-800 border border-red-300',
  };
  return colors[sentiment] || 'bg-gray-100 text-gray-700';
}

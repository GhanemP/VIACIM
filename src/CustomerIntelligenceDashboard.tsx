import { useState, useMemo } from 'react';
import type { Customer, DashboardMetrics } from './types';
import { generateDemoCustomers } from './demoDataEnhanced';
import { getHealthScoreColor, formatCurrency, formatRelativeDate } from './utils';

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

// Alternative Timeline Implementation - Available for future use
// This horizontal timeline component provides an alternative visualization.

export interface TimelineInteraction {
  id: string;
  timestamp: Date;
  type: string;
  title: string;
  summary: string;
  sentiment: string;
  tags: string[];
}

export function HorizontalTimeline({
  interactions,
  onInteractionClick,
  selectedId,
}: {
  interactions: TimelineInteraction[];
  onInteractionClick: (id: string) => void;
  selectedId: string | null;
}) {
  if (interactions.length === 0) return null;

  const firstDate = interactions[0].timestamp.getTime();
  const lastDate = Math.max(...interactions.map(i => i.timestamp.getTime()), Date.now());
  const totalDuration = lastDate - firstDate;

  // Calculate position for each interaction (0-100%)
  const getPosition = (timestamp: Date) => {
    if (totalDuration === 0) return 0;
    return ((timestamp.getTime() - firstDate) / totalDuration) * 100;
  };

  // Detect gaps between interactions
  const gaps: Array<{ start: number; end: number; days: number; severity: 'low' | 'medium' | 'high' }> = [];
  for (let i = 0; i < interactions.length - 1; i++) {
    const current = interactions[i];
    const next = interactions[i + 1];
    const gapDays = Math.floor((next.timestamp.getTime() - current.timestamp.getTime()) / (1000 * 60 * 60 * 24));

    if (gapDays > 7) {
      gaps.push({
        start: getPosition(current.timestamp),
        end: getPosition(next.timestamp),
        days: gapDays,
        severity: gapDays > 60 ? 'high' : gapDays > 30 ? 'medium' : 'low',
      });
    }
  }

  // Identify milestone events (major wins)
  const isMilestone = (interaction: TimelineInteraction) => {
    const title = interaction.title.toLowerCase();
    return (
      title.includes('signed') ||
      title.includes('contract') ||
      title.includes('closed') ||
      title.includes('upsell') ||
      title.includes('🎉') ||
      title.includes('💰') ||
      title.includes('🎯') ||
      (interaction.tags.includes('success') && interaction.sentiment === 'very-positive')
    );
  };

  return (
    <div className="my-8">
      <div className="mb-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 rounded-lg text-sm text-blue-900 shadow-sm">
        <strong>💡 Interactive Timeline:</strong> Click any marker to preview details. Look for <span className="inline-block animate-pulse">✨ celebration effects</span> on major milestones!
      </div>

      {/* Timeline Stats Summary */}
      <div className="mb-4 grid grid-cols-4 gap-3 text-center text-xs">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="font-bold text-lg text-gray-900">{interactions.length}</div>
          <div className="text-gray-600">Total Interactions</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="font-bold text-lg text-green-600">
            {interactions.filter(i => i.sentiment === 'very-positive' || i.sentiment === 'positive').length}
          </div>
          <div className="text-gray-600">Positive</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="font-bold text-lg text-red-600">
            {interactions.filter(i => i.tags.some((t: string) => ['risk', 'complaint', 'churn-signal'].includes(t))).length}
          </div>
          <div className="text-gray-600">Risk Events</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="font-bold text-lg text-emerald-600">
            {interactions.filter(i => i.tags.some((t: string) => ['opportunity', 'upsell', 'success'].includes(t))).length}
          </div>
          <div className="text-gray-600">Opportunities</div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl px-12 py-24 min-h-[400px] shadow-inner overflow-x-auto border border-gray-200">
        {/* Timeline Line with gradient progress */}
        <div className="absolute top-1/2 left-12 right-12 h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transform -translate-y-1/2 rounded-full shadow-lg" >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-full opacity-50 blur-sm"></div>
        </div>

        {/* Gap Overlays */}
        {gaps.map((gap, idx) => (
          <div
            key={idx}
            className={`absolute top-1/4 bottom-1/4 rounded-lg border-2 border-dashed transition-all ${
              gap.severity === 'high'
                ? 'bg-red-100 border-red-400 opacity-30'
                : gap.severity === 'medium'
                ? 'bg-yellow-100 border-yellow-400 opacity-30'
                : 'bg-gray-200 border-gray-400 opacity-20'
            }`}
            style={{
              left: `calc(3rem + (100% - 6rem) * ${gap.start / 100})`,
              right: `calc(3rem + (100% - 6rem) * ${(100 - gap.end) / 100})`,
            }}
          >
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold whitespace-nowrap px-2 py-1 rounded ${
                gap.severity === 'high'
                  ? 'bg-red-200 text-red-900'
                  : gap.severity === 'medium'
                  ? 'bg-yellow-200 text-yellow-900'
                  : 'bg-gray-300 text-gray-800'
              }`}
            >
              ⚠️ {gap.days}d gap
            </div>
          </div>
        ))}

        {/* Interaction Markers */}
        {interactions.map((interaction, index) => {
          const position = getPosition(interaction.timestamp);
          const isSelected = selectedId === interaction.id;
          const sentiment = interaction.sentiment;
          const milestone = isMilestone(interaction);

          // Get color based on sentiment
          let markerColor = 'bg-blue-500 border-blue-700';
          let markerSize = 'w-6 h-6';

          if (sentiment === 'very-positive') markerColor = 'bg-green-500 border-green-700';
          else if (sentiment === 'positive') markerColor = 'bg-green-400 border-green-600';
          else if (sentiment === 'negative') markerColor = 'bg-orange-500 border-orange-700';
          else if (sentiment === 'very-negative') markerColor = 'bg-red-500 border-red-700';

          const hasRiskTag = interaction.tags.some((t: string) =>
            ['risk', 'complaint', 'churn-signal'].includes(t)
          );
          const hasOpportunityTag = interaction.tags.some((t: string) =>
            ['opportunity', 'upsell', 'success'].includes(t)
          );
          const hasChampionTag = interaction.tags.includes('champion');

          if (hasRiskTag) markerColor = 'bg-red-600 border-red-800 animate-pulse';
          if (hasOpportunityTag) markerColor = 'bg-emerald-500 border-emerald-700';

          // Milestones get larger markers with special effects
          if (milestone) {
            markerSize = 'w-8 h-8';
            markerColor = 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-600';
          }

          // Alternate above/below for better spacing
          const isAbove = index % 2 === 0;

          return (
            <div
              key={interaction.id}
              className="absolute group"
              style={{
                left: `calc(3rem + (100% - 6rem) * ${position / 100})`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Vertical connector line */}
              <div
                className={`absolute left-1/2 w-0.5 bg-gray-400 ${
                  isAbove ? 'bottom-full mb-3' : 'top-full mt-3'
                }`}
                style={{ height: '50px' }}
              />

              {/* Marker dot */}
              <button
                onClick={() => onInteractionClick(interaction.id)}
                className={`relative z-10 ${markerSize} rounded-full border-4 transition-all transform hover:scale-150 cursor-pointer ${markerColor} ${
                  isSelected ? 'scale-150 ring-4 ring-blue-300 shadow-lg' : ''
                }`}
                title={interaction.title}
                aria-label={`View interaction: ${interaction.title}`}
              >
                {/* Pulse animation for risk items */}
                {hasRiskTag && (
                  <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                )}
                {/* Glow effect for opportunities */}
                {hasOpportunityTag && !milestone && (
                  <span className="absolute inset-0 rounded-full bg-emerald-300 animate-pulse opacity-50" />
                )}
                {/* Celebration sparkles for milestones */}
                {milestone && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-yellow-200 animate-ping opacity-60" />
                    <span className="absolute -top-1 -right-1 text-xs">✨</span>
                    <span className="absolute -bottom-1 -left-1 text-xs">🎉</span>
                  </>
                )}
                {/* Champion crown indicator */}
                {hasChampionTag && (
                  <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-sm">👑</span>
                )}
              </button>

              {/* Preview card shows when marker is selected */}
              {isSelected && (
                <div
                  className={`absolute left-1/2 transform -translate-x-1/2 z-50 ${
                    isAbove ? 'bottom-full mb-24' : 'top-full mt-24'
                  }`}
                >
                  <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-500 p-4 min-w-[320px] max-w-[420px] animate-in fade-in zoom-in duration-200">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-4xl">{getInteractionIcon(interaction.type)}</span>
                      <div className="flex-1">
                        <div className="font-bold text-base mb-1">{interaction.title}</div>
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {interaction.summary}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap mb-3">
                      {interaction.tags.slice(0, 4).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className={`px-2 py-1 rounded text-[10px] font-semibold ${getSentimentBadgeColor(interaction.sentiment)}`}>
                        {getSentimentEmoji(interaction.sentiment)} {interaction.sentiment}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      📅 {new Date(interaction.timestamp).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-xs font-semibold text-blue-600 text-center">
                      Click marker again to open Evidence Locker with full details →
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Date labels at start and end */}
        <div className="absolute bottom-6 left-12 text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
          {new Date(firstDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div className="absolute bottom-6 right-12 text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
          Today
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="text-xs font-bold text-gray-500 uppercase mb-3">Timeline Legend</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-700" />
            <span className="text-gray-700">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-700" />
            <span className="text-gray-700">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-700" />
            <span className="text-gray-700">Negative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-red-800 animate-pulse" />
            <span className="text-gray-700">Risk/Crisis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-700" />
            <span className="text-gray-700">Opportunity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-yellow-600">
              <span className="absolute -top-1 -right-1 text-xs">✨</span>
            </div>
            <span className="text-gray-700">Milestone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4 rounded-full bg-green-500 border-2 border-green-700">
              <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs">👑</span>
            </div>
            <span className="text-gray-700">Champion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-3 rounded bg-red-100 border border-red-400 border-dashed opacity-60" />
            <span className="text-gray-700">Gap</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerJourneyView({ customer, onBack }: { customer: Customer; onBack: () => void }) {
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
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
      if (filterType !== 'all' && interaction.type !== filterType) return false;
      if (filterSentiment !== 'all' && interaction.sentiment !== filterSentiment) return false;
      return true;
    });
  }, [sortedInteractions, filterType, filterSentiment]);

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

  const handleInteractionClick = (id: string) => {
    setSelectedInteractionId(id);
  };

  const closeDrawer = () => {
    setSelectedInteractionId(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Elegant Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="h-5 w-px bg-neutral-200"></div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">{customer.name}</h1>
                <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                  <span className="capitalize">{customer.stage.replace('-', ' ')}</span>
                  <span>·</span>
                  <span>{formatCurrency(customer.mrr)}/mo</span>
                  <span>·</span>
                  <span>{customer.tenure}m tenure</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-0.5 bg-neutral-100/80 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'timeline'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  List
                </button>
              </div>

              {/* Health Score Badge */}
              <div className="flex items-center gap-4 px-4 py-2 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-right">
                  <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide">Health Score</div>
                  <div
                    className="text-xl font-semibold mt-0.5"
                    style={{ color: getHealthScoreColor(customer.healthScore) }}
                  >
                    {customer.healthScore}
                  </div>
                </div>
                <RiskBadge level={customer.riskLevel} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Refined Filters Bar */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-1">
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Filter by</div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                {['all', 'call', 'email', 'meeting', 'support', 'product-usage', 'billing'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterType === type
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                    }`}
                  >
                    {type === 'all' ? 'All' : getInteractionIcon(type) + ' ' + type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>

              <div className="h-5 w-px bg-neutral-200"></div>

              {/* Sentiment Filter */}
              <div className="flex items-center gap-2">
                {['all', 'very-positive', 'positive', 'neutral', 'negative', 'very-negative'].map(sentiment => (
                  <button
                    key={sentiment}
                    type="button"
                    onClick={() => setFilterSentiment(sentiment)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterSentiment === sentiment
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                    }`}
                  >
                    {sentiment === 'all' ? 'All' : getSentimentEmoji(sentiment)}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-neutral-500">
              <span className="font-semibold text-neutral-900">{filteredInteractions.length}</span> of {sortedInteractions.length}
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

// Advanced Timeline Chart Component
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
      {/* Timeline Header */}
      <div className="px-8 py-5 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">Timeline</h3>
            <p className="text-xs text-neutral-500 mt-0.5">{interactions.length} interactions · {Math.floor(totalDuration / (1000 * 60 * 60 * 24))} days</p>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Canvas */}
      <div className="relative bg-white p-12 min-h-[450px]">
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

// Alternative Vertical Timeline Component - Available for future use
// This component provides a stage-grouped vertical timeline view.
export function VerticalTimeline({
  groupedByStage,
  onInteractionClick,
  selectedId,
}: {
  groupedByStage: Record<string, Array<{
    id: string;
    timestamp: Date;
    type: string;
    title: string;
    summary: string;
    sentiment: string;
    tags: string[];
    stage: string;
  }>>;
  onInteractionClick: (id: string) => void;
  selectedId: string | null;
}) {
  const stageOrder = ['prospect', 'onboarding', 'adoption', 'active', 'expansion', 'at-risk', 'churned'];
  const stageLabels: Record<string, string> = {
    prospect: '🎯 Prospect',
    onboarding: '🚀 Onboarding',
    adoption: '📈 Adoption',
    active: '✅ Active',
    expansion: '🌟 Expansion',
    'at-risk': '⚠️ At Risk',
    churned: '🚪 Churned',
  };

  const stageColors: Record<string, string> = {
    prospect: 'border-blue-300 bg-blue-50',
    onboarding: 'border-purple-300 bg-purple-50',
    adoption: 'border-indigo-300 bg-indigo-50',
    active: 'border-green-300 bg-green-50',
    expansion: 'border-emerald-300 bg-emerald-50',
    'at-risk': 'border-orange-300 bg-orange-50',
    churned: 'border-red-300 bg-red-50',
  };

  return (
    <div className="space-y-6">
      {stageOrder.map(stage => {
        const stageInteractions = groupedByStage[stage] || [];
        if (stageInteractions.length === 0) return null;

        return (
          <div key={stage} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Stage Header */}
            <div className={`px-6 py-3 border-l-4 ${stageColors[stage]}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{stageLabels[stage] || stage}</h3>
                <span className="text-sm text-gray-600">{stageInteractions.length} interactions</span>
              </div>
            </div>

            {/* Interactions in this stage */}
            <div className="p-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200"></div>

                <div className="space-y-6">
                  {stageInteractions.map((interaction) => (
                    <InteractionCard
                      key={interaction.id}
                      interaction={interaction}
                      isSelected={selectedId === interaction.id}
                      onClick={() => onInteractionClick(interaction.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Interaction Card Component
function InteractionCard({
  interaction,
  isSelected,
  onClick,
}: {
  interaction: {
    id: string;
    timestamp: Date;
    type: string;
    title: string;
    summary: string;
    sentiment: string;
    tags: string[];
  };
  isSelected: boolean;
  onClick: () => void;
}) {
  const hasRisk = interaction.tags.some((t: string) => ['risk', 'complaint', 'churn-signal'].includes(t));
  const hasOpportunity = interaction.tags.some((t: string) => ['opportunity', 'upsell', 'success'].includes(t));
  const isChampion = interaction.tags.includes('champion');

  let borderColor = 'border-gray-200';
  let bgColor = 'bg-white';

  if (hasRisk) {
    borderColor = 'border-red-300';
    bgColor = 'bg-red-50';
  } else if (hasOpportunity) {
    borderColor = 'border-emerald-300';
    bgColor = 'bg-emerald-50';
  }

  return (
    <div className="relative pl-12">
      {/* Timeline dot */}
      <div className={`absolute left-4 top-4 w-5 h-5 rounded-full border-4 ${
        hasRisk ? 'bg-red-500 border-red-200' :
        hasOpportunity ? 'bg-emerald-500 border-emerald-200' :
        'bg-blue-500 border-blue-200'
      } shadow-sm z-10`}>
        {isChampion && <span className="absolute -top-3 -right-3 text-sm">👑</span>}
      </div>

      {/* Card */}
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left border-2 ${borderColor} ${bgColor} rounded-lg p-4 transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-400 shadow-lg scale-[1.02]' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getInteractionIcon(interaction.type)}</span>
              <div>
                <h4 className="font-bold text-gray-900">{interaction.title}</h4>
                <p className="text-xs text-gray-500">
                  {interaction.timestamp.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">{interaction.summary}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-3">
              {interaction.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300"
                >
                  {tag}
                </span>
              ))}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSentimentBadgeColor(interaction.sentiment)}`}>
                {getSentimentEmoji(interaction.sentiment)} {interaction.sentiment}
              </span>
            </div>
          </div>

          {/* Expand icon */}
          <div className="flex-shrink-0">
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
}

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

// Evidence Locker Component - Available for future use
// This modal component provides detailed interaction viewing.
export interface EvidenceLockerProps {
  interaction: {
    id: string;
    type: string;
    timestamp: Date;
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
}

export function EvidenceLocker({ interaction, onClose }: EvidenceLockerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Interaction Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{getInteractionIcon(interaction.type)}</span>
            <div>
              <div className="text-sm font-semibold text-gray-500 uppercase">
                {interaction.type} • {formatRelativeDate(interaction.timestamp)}
              </div>
              <h3 className="text-2xl font-bold">{interaction.title}</h3>
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-4">{interaction.summary}</p>

          <div className="flex gap-2 flex-wrap mb-6">
            {interaction.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                {tag}
              </span>
            ))}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSentimentBadgeColor(interaction.sentiment)}`}>
              {getSentimentEmoji(interaction.sentiment)} {interaction.sentiment}
            </span>
          </div>

          {interaction.duration && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Duration</div>
                <div className="text-xl font-bold">{interaction.duration} min</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Participants</div>
                <div className="text-sm font-semibold">{interaction.participants.join(', ')}</div>
              </div>
            </div>
          )}

          {interaction.transcript && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
              <h4 className="font-bold mb-2">🎙️ Call Transcript</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {interaction.transcript}
              </div>
            </div>
          )}

          {interaction.aiInsights && interaction.aiInsights.length > 0 && (
            <div className="mb-6 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
              <h4 className="font-bold mb-3">🤖 AI Insights</h4>
              <div className="space-y-2">
                {interaction.aiInsights.map(insight => (
                  <div key={insight.id} className="bg-white border border-purple-200 rounded-lg p-3 flex items-start gap-3">
                    <span className="text-xl">{insight.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold">{insight.title}</div>
                      <div className="text-sm text-gray-600">{insight.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {interaction.recommendedActions && interaction.recommendedActions.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <h4 className="font-bold mb-3">✅ Recommended Actions</h4>
              <div className="space-y-2">
                {interaction.recommendedActions.map(action => (
                  <button
                    key={action.id}
                    className="w-full text-left bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
                  >
                    → {action.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
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

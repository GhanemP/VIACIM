import { useState, useMemo } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Elegant Header */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200 shadow-elegant">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-8 py-12">
          <div className="flex justify-between items-start">
            <div className="space-y-2 fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Intelligence</h1>
                  <p className="text-sm text-gray-500 font-medium">Real-time health & engagement analytics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 fade-in">
              <button className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all hover-lift flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filters
              </button>
              <button className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg transition-all shadow-lg hover-lift flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 fade-in">
          <KPICard
            label="At Risk Customers"
            value={metrics.atRiskCount}
            subtitle={`of ${metrics.totalCustomers} total`}
            icon="🚨"
            gradient="from-red-500 to-rose-600"
            iconBg="from-red-500 to-rose-600"
          />
          <KPICard
            label="Total MRR"
            value={formatCurrency(metrics.totalMRR)}
            icon="💰"
            gradient="from-violet-500 to-indigo-600"
            iconBg="from-violet-500 to-indigo-600"
          />
          <KPICard
            label="Avg Health Score"
            value={metrics.avgHealthScore}
            icon="💚"
            gradient="from-emerald-500 to-green-600"
            iconBg="from-emerald-500 to-green-600"
          />
          <KPICard
            label="Active Opportunities"
            value={metrics.activeOpportunities}
            icon="🎯"
            gradient="from-blue-500 to-cyan-600"
            iconBg="from-blue-500 to-cyan-600"
          />
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-2xl shadow-elegant-lg overflow-hidden border border-gray-100">
          <div className="p-8 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Portfolio</h2>
                <p className="text-sm text-gray-500 mt-1">{sortedCustomers.length} customers · {metrics.atRiskCount} require attention</p>
              </div>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white focus:bg-white w-72 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    Stage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    Health
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    MRR
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    Last Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    Risk Level
                  </th>
                  <th className="px-8 py-4 bg-gray-50/50"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedCustomers.map(customer => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className="hover:bg-gradient-to-r hover:from-violet-50/30 hover:to-transparent cursor-pointer transition-all group"
                  >
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md ${
                          customer.healthScore >= 80 ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                          customer.healthScore >= 60 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                          customer.healthScore >= 40 ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                          'bg-gradient-to-br from-red-500 to-rose-600'
                        }`}>
                          {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.assignedTo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                        {customer.stage.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-3xl font-black tracking-tight"
                          style={{ color: getHealthScoreColor(customer.healthScore) }}
                        >
                          {customer.healthScore}
                        </span>
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${customer.healthScore}%`,
                              backgroundColor: getHealthScoreColor(customer.healthScore)
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="font-bold text-gray-900">
                        {customer.mrr > 0 ? formatCurrency(customer.mrr) : '-'}
                      </div>
                      {customer.mrr > 0 && (
                        <div className="text-xs text-gray-500">per month</div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        customer.lastContactDays === 0 ? 'text-emerald-600' :
                        customer.lastContactDays <= 7 ? 'text-gray-700' :
                        customer.lastContactDays <= 14 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {customer.lastContactDays === 0 ? 'Today' : `${customer.lastContactDays}d ago`}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <RiskBadge level={customer.riskLevel} />
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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
  icon,
  gradient,
  iconBg
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  gradient: string;
  iconBg: string;
}) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-elegant border border-gray-100 hover-lift group">
      {/* Gradient accent bar at top */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {label}
          </div>
          <div className="text-4xl font-black text-gray-900 tracking-tight">
            {value}
          </div>
          {subtitle && (
            <div className="text-sm text-gray-500 font-medium">{subtitle}</div>
          )}
        </div>
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const config = {
    low: {
      className: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200',
      icon: '✓',
      label: 'Low Risk'
    },
    medium: {
      className: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200',
      icon: '◐',
      label: 'Medium'
    },
    high: {
      className: 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border-orange-200',
      icon: '⚠',
      label: 'High Risk'
    },
    critical: {
      className: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200',
      icon: '🚨',
      label: 'Critical'
    },
  };

  const badge = config[level as keyof typeof config];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${badge.className}`}>
      <span>{badge.icon}</span>
      {badge.label}
    </span>
  );
}


function CustomerJourneyView({ customer, onBack }: { customer: Customer; onBack: () => void }) {
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(
    new Set(['call', 'email', 'meeting', 'support', 'product-usage', 'billing'])
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
      return true;
    });
  }, [sortedInteractions, enabledTypes]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Minimal Sticky Header - View Toggle Only */}
      <div className="glass border-b border-white/20 sticky top-0 z-40 shadow-elegant">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/50 transition-all text-gray-700 hover:text-gray-900"
                title="Back to Dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="text-sm font-bold text-gray-900">{customer.name}</div>
                <div className="text-xs text-gray-500">Customer Journey Analysis</div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'timeline'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Timeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Layer 1: Hero Card - Progressive Disclosure "So What?" */}
        <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-200 p-12 mb-8 shadow-elegant-lg hover-lift group fade-in">
          {/* Gradient background accent */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: `linear-gradient(135deg, ${getHealthScoreColor(customer.healthScore)}15 0%, transparent 100%)`
            }}
          ></div>

          <div className="relative">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-baseline gap-8">
                {/* Massive Health Score - The Focal Point */}
                <div className="relative">
                  <div
                    className="text-9xl font-black tracking-tighter drop-shadow-sm"
                    style={{ color: getHealthScoreColor(customer.healthScore) }}
                  >
                    {customer.healthScore}
                  </div>
                  {/* Circular progress indicator behind the number */}
                  <svg className="absolute inset-0 w-full h-full -z-10 opacity-20" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={getHealthScoreColor(customer.healthScore)}
                      strokeWidth="2"
                      strokeDasharray={`${customer.healthScore * 2.83} 283`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  {/* State - Connected to Score */}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-gray-900 capitalize tracking-tight">
                      {customer.riskLevel} Risk
                    </span>
                    <RiskBadge level={customer.riskLevel} />
                  </div>

                  {/* Reason - The "Why" */}
                  <div className="flex flex-col gap-2">
                    <div className="text-base text-gray-600 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-bold text-gray-900">{largestGap}</span> days max engagement gap
                    </div>
                    {customer.lastContactDays > 7 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-bold">{customer.lastContactDays}</span> days since last contact
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-4 gap-6 pt-6 border-t border-gray-200">
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account</div>
                <div className="font-bold text-gray-900">{customer.name}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stage</div>
                <div className="font-bold text-gray-900 capitalize">{customer.stage.replace('-', ' ')}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Revenue</div>
                <div className="font-bold text-gray-900">{formatCurrency(customer.mrr)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tenure</div>
                <div className="font-bold text-gray-900">{customer.tenure} months</div>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 3: Refined Filters Bar (with custom toggle switches) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-elegant fade-in">
          <div className="space-y-6">
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

            <div className="border-t border-neutral-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">
                  Showing <span className="font-bold text-neutral-900">{filteredInteractions.length}</span> of <span className="font-semibold text-neutral-700">{sortedInteractions.length}</span> interactions
                </span>
                <button
                  onClick={() => {
                    setEnabledTypes(new Set(['call', 'email', 'meeting', 'support', 'product-usage', 'billing']));
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Journey Overview - Redesigned */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-elegant fade-in">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Journey Overview</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {customer.interactions.length} touchpoints over {customer.tenure} month relationship
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 p-6 hover-lift">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-600">
                    {sortedInteractions.filter(i => i.sentiment === 'very-positive' || i.sentiment === 'positive').length}
                  </div>
                </div>
              </div>
              <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Positive Interactions</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200 p-6 hover-lift">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-black text-red-600">
                    {sortedInteractions.filter(i => i.tags.some(t => ['risk', 'complaint', 'churn-signal'].includes(t))).length}
                  </div>
                </div>
              </div>
              <div className="text-xs text-red-700 font-bold uppercase tracking-wider">Risk Signals Detected</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 hover-lift">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-black text-blue-600">
                    {sortedInteractions.filter(i => i.tags.some(t => ['opportunity', 'upsell', 'success'].includes(t))).length}
                  </div>
                </div>
              </div>
              <div className="text-xs text-blue-700 font-bold uppercase tracking-wider">Growth Opportunities</div>
            </div>
          </div>

          {/* Health Trend Visualization */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6">
            <HealthTrendChart healthTrend={healthTrend} />
          </div>
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

// Health Trend Chart Component - Enhanced
function HealthTrendChart({ healthTrend }: { healthTrend: Array<{ date: Date; score: number; sentiment: string }> }) {
  if (healthTrend.length === 0) return null;

  const maxScore = 100;
  const minScore = 0;

  return (
    <div className="relative">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900">Health Score Trend</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
            <span className="text-xs text-gray-600 font-medium">Healthy (80+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
            <span className="text-xs text-gray-600 font-medium">At Risk (40-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
            <span className="text-xs text-gray-600 font-medium">Critical (&lt;40)</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-end justify-between h-32 gap-1">
          {healthTrend.map((point, index) => {
            const heightPercent = ((point.score - minScore) / (maxScore - minScore)) * 100;
            const isFirst = index === 0;
            const isLast = index === healthTrend.length - 1;
            const prevScore = index > 0 ? healthTrend[index - 1].score : point.score;
            const isImproving = point.score > prevScore;
            const isDeclining = point.score < prevScore;

            let barColor = 'from-gray-400 to-gray-500';
            let barColorSolid = 'bg-gray-400';
            if (point.score >= 80) {
              barColor = 'from-emerald-400 to-emerald-600';
              barColorSolid = 'bg-emerald-500';
            } else if (point.score >= 60) {
              barColor = 'from-blue-400 to-blue-600';
              barColorSolid = 'bg-blue-500';
            } else if (point.score >= 40) {
              barColor = 'from-amber-400 to-amber-600';
              barColorSolid = 'bg-amber-500';
            } else {
              barColor = 'from-red-400 to-red-600';
              barColorSolid = 'bg-red-500';
            }

            return (
              <div key={index} className="flex-1 flex flex-col items-center group relative">
                {/* Score label on hover */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className={`${barColorSolid} text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg whitespace-nowrap`}>
                    {point.score}
                    {!isFirst && (
                      <span className="ml-1 text-[10px]">
                        {isImproving && '↑'}
                        {isDeclining && '↓'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar */}
                <div
                  className={`w-full bg-gradient-to-t ${barColor} rounded-t-lg transition-all hover:shadow-lg cursor-pointer relative overflow-hidden group-hover:scale-105`}
                  style={{ height: `${Math.max(heightPercent, 3)}%` }}
                  title={`${point.date.toLocaleDateString()}: Score ${point.score}`}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </div>

                {/* Date label */}
                {(isFirst || isLast || index % Math.ceil(healthTrend.length / 6) === 0) && (
                  <div className="text-[10px] text-gray-500 mt-2 whitespace-nowrap font-medium">
                    {point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-xs text-gray-500 font-medium mb-1">Starting Score</div>
          <div className="text-2xl font-black" style={{ color: getHealthScoreColor(healthTrend[0].score) }}>
            {healthTrend[0].score}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-xs text-gray-500 font-medium mb-1">Current Score</div>
          <div className="text-2xl font-black" style={{ color: getHealthScoreColor(healthTrend[healthTrend.length - 1].score) }}>
            {healthTrend[healthTrend.length - 1].score}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-xs text-gray-500 font-medium mb-1">Change</div>
          <div className={`text-2xl font-black ${
            healthTrend[healthTrend.length - 1].score > healthTrend[0].score ? 'text-emerald-600' :
            healthTrend[healthTrend.length - 1].score < healthTrend[0].score ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {healthTrend[healthTrend.length - 1].score > healthTrend[0].score && '+'}
            {healthTrend[healthTrend.length - 1].score - healthTrend[0].score}
          </div>
        </div>
      </div>
    </div>
  );
}

// Redesigned Timeline - Simple, Intuitive, Card-Based
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
      <div className="bg-white rounded-2xl border border-gray-200 p-20 text-center shadow-elegant">
        <div className="text-gray-400 text-sm font-medium">No interactions match the current filters</div>
      </div>
    );
  }

  // Group interactions by month
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, typeof interactions> = {};
    interactions.forEach(interaction => {
      const monthKey = interaction.timestamp.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(interaction);
    });
    return groups;
  }, [interactions]);

  const monthKeys = Object.keys(groupedByMonth);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-elegant fade-in">
      {/* Timeline Header */}
      <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Timeline View
            </h3>
            <p className="text-sm text-gray-600 mt-2 ml-13">
              {interactions.length} interactions across {monthKeys.length} {monthKeys.length === 1 ? 'month' : 'months'}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Timeline Content */}
      <div className="p-8 max-h-[800px] overflow-y-auto">
        <div className="space-y-8">
          {monthKeys.map((monthKey, monthIndex) => {
            const monthInteractions = groupedByMonth[monthKey];

            return (
              <div key={monthKey} className="relative">
                {/* Month Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-white px-4 py-3 rounded-xl border border-gray-200 mb-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {monthInteractions.length}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">{monthKey}</h4>
                  </div>
                </div>

                {/* Interaction Cards */}
                <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                  {monthInteractions.map((interaction) => {
                    const isSelected = selectedId === interaction.id;
                    const hasRisk = interaction.tags.some(t => ['risk', 'complaint', 'churn-signal'].includes(t));
                    const hasOpportunity = interaction.tags.some(t => ['opportunity', 'upsell', 'success'].includes(t));
                    const isChampion = interaction.tags.includes('champion');

                    let borderColor = 'border-gray-200';
                    let bgGradient = 'from-white to-gray-50';
                    let iconBg = 'from-gray-600 to-gray-700';

                    if (hasRisk) {
                      borderColor = 'border-red-300';
                      bgGradient = 'from-red-50 to-rose-50';
                      iconBg = 'from-red-600 to-rose-600';
                    } else if (hasOpportunity) {
                      borderColor = 'border-emerald-300';
                      bgGradient = 'from-emerald-50 to-green-50';
                      iconBg = 'from-emerald-600 to-green-600';
                    }

                    return (
                      <div key={interaction.id} className="relative -ml-6">
                        {/* Timeline Dot */}
                        <div className={`absolute left-0 top-6 w-4 h-4 rounded-full border-4 border-white shadow-md ${
                          hasRisk ? 'bg-red-500' : hasOpportunity ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}></div>

                        {/* Interaction Card */}
                        <div className="ml-8">
                          <button
                            onClick={() => onInteractionClick(interaction.id)}
                            className={`w-full text-left bg-gradient-to-br ${bgGradient} rounded-xl border-2 ${borderColor} p-6 hover-lift transition-all ${
                              isSelected ? 'ring-4 ring-violet-300 shadow-xl scale-[1.02]' : 'shadow-sm'
                            } group`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-2xl shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                {getInteractionIcon(interaction.type)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    <h5 className="font-bold text-gray-900 text-base">{interaction.title}</h5>
                                    {isChampion && <span className="text-lg">👑</span>}
                                  </div>
                                  <div className="text-xs font-medium text-gray-500 whitespace-nowrap">
                                    {interaction.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    {' · '}
                                    {interaction.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                  {interaction.summary}
                                </p>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-700 capitalize">
                                    {interaction.type.replace('-', ' ')}
                                  </span>
                                  {interaction.tags.slice(0, 4).map(tag => {
                                    const isRiskTag = ['risk', 'complaint', 'churn-signal'].includes(tag);
                                    const isOppTag = ['opportunity', 'upsell', 'success'].includes(tag);
                                    return (
                                      <span
                                        key={tag}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                          isRiskTag ? 'bg-red-100 text-red-700 border border-red-200' :
                                          isOppTag ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                          'bg-gray-100 text-gray-700 border border-gray-200'
                                        }`}
                                      >
                                        {tag}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Arrow */}
                              <svg className={`w-6 h-6 text-gray-400 group-hover:text-violet-600 transform group-hover:translate-x-1 transition-all flex-shrink-0 ${
                                isSelected ? 'text-violet-600' : ''
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Gap Indicator between months */}
                {monthIndex < monthKeys.length - 1 && (
                  <div className="mt-8 mb-4 flex items-center gap-3 pl-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  </div>
                )}
              </div>
            );
          })}
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
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-elegant fade-in">
      <div className="divide-y divide-gray-100">
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

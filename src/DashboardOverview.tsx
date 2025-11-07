import { useCallback, useMemo, useState } from 'react';
import ControlPanel from './ControlPanel';
import AgentAssistView from './AgentAssistView';
import { JOURNEY_STAGE_ORDER, type StageOption } from './dashboardConstants';
import type { Customer, JourneyStage } from './types';
import { trackEvent } from './telemetry';

type DashboardOverviewProps = {
  customers: Customer[];
  onSelectCustomer: (customerId: string) => void;
  onViewInsights?: (insightId?: string) => void;
};

type DashboardView = 'all' | 'at-risk' | 'opportunities';

type MetricSnapshot = {
  totalCustomers: number;
  atRiskCount: number;
  totalMRR: number;
  avgHealthScore: number;
};

const computeStageOptions = (customers: Customer[]): StageOption[] => {
  const stageCounts = new Map<JourneyStage, number>();

  JOURNEY_STAGE_ORDER.forEach((stage) => stageCounts.set(stage, 0));

  customers.forEach((customer) => {
    const stagesForCustomer = new Set<JourneyStage>(
      customer.interactions.map((interaction) => interaction.stage)
    );

    stagesForCustomer.forEach((stage) => {
      stageCounts.set(stage, (stageCounts.get(stage) ?? 0) + 1);
    });
  });

  return JOURNEY_STAGE_ORDER.map((stage) => ({ stage, count: stageCounts.get(stage) ?? 0 }));
};

const computeAvailableOwners = (customers: Customer[]): string[] => {
  return Array.from(new Set(customers.map((customer) => customer.assignedTo))).sort((a, b) => a.localeCompare(b));
};

const computeMetrics = (customers: Customer[]): MetricSnapshot => {
  if (customers.length === 0) {
    return {
      totalCustomers: 0,
      atRiskCount: 0,
      totalMRR: 0,
      avgHealthScore: 0,
    };
  }

  const totalMRR = customers.reduce((sum, customer) => sum + customer.mrr, 0);
  const totalHealth = customers.reduce((sum, customer) => sum + customer.healthScore, 0);
  const atRiskCount = customers.filter((customer) => customer.riskLevel === 'critical' || customer.riskLevel === 'high').length;

  return {
    totalCustomers: customers.length,
    atRiskCount,
    totalMRR,
    avgHealthScore: totalHealth / customers.length,
  };
};

const filterCustomers = (
  customers: Customer[],
  filters: {
    searchQuery: string;
    selectedStages: JourneyStage[];
    selectedOwners: string[];
    view: DashboardView;
  }
): Customer[] => {
  const normalizedQuery = filters.searchQuery.trim().toLowerCase();
  const hasStageFilter = filters.selectedStages.length > 0;
  const hasOwnerFilter = filters.selectedOwners.length > 0;

  return customers.filter((customer) => {
    if (normalizedQuery) {
      const matchesQuery =
        customer.name.toLowerCase().includes(normalizedQuery) ||
        customer.assignedTo.toLowerCase().includes(normalizedQuery);
      if (!matchesQuery) {
        return false;
      }
    }

    if (hasStageFilter) {
      const stageSet = new Set(filters.selectedStages);
      if (!stageSet.has(customer.stage as JourneyStage)) {
        return false;
      }
    }

    if (hasOwnerFilter) {
      const ownerSet = new Set(filters.selectedOwners);
      if (!ownerSet.has(customer.assignedTo)) {
        return false;
      }
    }

    if (filters.view === 'at-risk') {
      return customer.riskLevel === 'critical' || customer.riskLevel === 'high';
    }

    if (filters.view === 'opportunities') {
      const hasOpportunity = customer.interactions.some(
        (interaction) => interaction.score.opportunity > interaction.score.risk
      );
      return hasOpportunity && customer.riskLevel !== 'critical';
    }

    return true;
  });
};

const getHealthColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  if (score >= 20) return 'text-orange-600';
  return 'text-red-600';
};

const DashboardOverview = ({ customers, onSelectCustomer, onViewInsights }: DashboardOverviewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStages, setSelectedStages] = useState<JourneyStage[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [dashboardView, setDashboardView] = useState<DashboardView>('all');

  const filteredCustomers = useMemo(
    () =>
      filterCustomers(customers, {
        searchQuery,
        selectedStages,
        selectedOwners,
        view: dashboardView,
      }),
    [customers, searchQuery, selectedStages, selectedOwners, dashboardView]
  );

  const stageOptions = useMemo(() => computeStageOptions(customers), [customers]);
  const availableOwners = useMemo(() => computeAvailableOwners(customers), [customers]);
  const metrics = useMemo(() => computeMetrics(filteredCustomers), [filteredCustomers]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedStages.length > 0 || selectedOwners.length > 0 || dashboardView !== 'all'
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    const trimmed = query.trim();
    if (trimmed) {
      trackEvent({ type: 'FILTER_SEARCH_USED', payload: { searchTerm: trimmed } });
    } else {
      trackEvent({ type: 'FILTER_APPLY', payload: { filterType: 'search', value: '', action: 'clear' } });
    }
  }, []);

  const handleToggleStage = useCallback((stage: JourneyStage) => {
    setSelectedStages((prev) => {
      const isSelected = prev.includes(stage);
      trackEvent({
        type: 'FILTER_APPLY',
        payload: { filterType: 'stage', value: stage, action: isSelected ? 'remove' : 'add' },
      });
      return isSelected ? prev.filter((item) => item !== stage) : [...prev, stage];
    });
  }, []);

  const handleToggleOwner = useCallback((owner: string) => {
    setSelectedOwners((prev) => {
      const isSelected = prev.includes(owner);
      trackEvent({
        type: 'FILTER_APPLY',
        payload: { filterType: 'owner', value: owner, action: isSelected ? 'remove' : 'add' },
      });
      return isSelected ? prev.filter((item) => item !== owner) : [...prev, owner];
    });
  }, []);

  const handleViewChange = useCallback((nextView: DashboardView) => {
    setDashboardView(nextView);
    trackEvent({ type: 'FILTER_APPLY', payload: { filterType: 'view', value: nextView } });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedStages([]);
    setSelectedOwners([]);
    setDashboardView('all');
    trackEvent({ type: 'FILTER_APPLY', payload: { filterType: 'all', value: [], action: 'clear' } });
  }, []);

  const handleCreateCustomer = useCallback(() => {
    trackEvent({ type: 'FILTER_APPLY', payload: { filterType: 'action', value: 'create-customer' } });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="gradient-header sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">VIA Customer Intelligence</h1>
              <p className="text-sm text-white/90 mt-0.5">Monitor customer health and engagement in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="metric-card">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/20">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{metrics.totalCustomers}</div>
                  <div className="text-xs text-white/80">Customers</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-red-500/30">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{metrics.atRiskCount}</div>
                  <div className="text-xs text-white/80">At Risk</div>
                </div>
              </div>
              {onViewInsights && (
                <button type="button" onClick={() => onViewInsights?.()} className="btn-glass flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Insights
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card p-5 fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics.totalCustomers}</p>
          </div>

          <div className="card p-5 fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">At Risk</p>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600">{metrics.atRiskCount}</p>
          </div>

          <div className="card p-5 fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total MRR</p>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">${metrics.totalMRR.toLocaleString()}</p>
          </div>

          <div className="card p-5 fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  metrics.avgHealthScore >= 80
                    ? 'bg-green-100'
                    : metrics.avgHealthScore >= 60
                    ? 'bg-blue-100'
                    : metrics.avgHealthScore >= 40
                    ? 'bg-yellow-100'
                    : 'bg-red-100'
                }`}
              >
                <svg
                  className={`w-5 h-5 ${
                    metrics.avgHealthScore >= 80
                      ? 'text-green-600'
                      : metrics.avgHealthScore >= 60
                      ? 'text-blue-600'
                      : metrics.avgHealthScore >= 40
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className={`text-3xl font-bold ${getHealthColor(metrics.avgHealthScore)}`}>
              {Math.round(metrics.avgHealthScore)}
            </p>
          </div>
        </div>

        <ControlPanel
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedStages={selectedStages}
          onToggleStage={handleToggleStage}
          stageOptions={stageOptions}
          availableOwners={availableOwners}
          selectedOwners={selectedOwners}
          onToggleOwner={handleToggleOwner}
          onClearFilters={handleClearFilters}
          onCreateCustomer={handleCreateCustomer}
          hasActiveFilters={hasActiveFilters}
        />

        {hasActiveFilters && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
            Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> customers
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Portfolio</h2>
          <div className="tab-nav">
            <button
              type="button"
              onClick={() => handleViewChange('all')}
              className={`tab-btn ${dashboardView === 'all' ? 'active' : ''}`}
            >
              All Customers
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('at-risk')}
              className={`tab-btn ${dashboardView === 'at-risk' ? 'active' : ''}`}
            >
              At Risk ({customers.filter((customer) => customer.riskLevel === 'critical' || customer.riskLevel === 'high').length})
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('opportunities')}
              className={`tab-btn ${dashboardView === 'opportunities' ? 'active' : ''}`}
            >
              Opportunities
            </button>
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg font-medium text-gray-600">No customers found</p>
            <p className="text-sm text-gray-400 mt-1">
              {dashboardView === 'opportunities'
                ? 'No opportunity customers at this time'
                : dashboardView === 'at-risk'
                ? 'No at-risk customers found'
                : hasActiveFilters
                ? 'Try adjusting your filters'
                : 'No customers available'}
            </p>
            {hasActiveFilters && (
              <button type="button" onClick={handleClearFilters} className="mt-4 btn-gradient text-sm">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Critical Priority Section */}
            {(() => {
              const criticalCustomers = filteredCustomers.filter(c => c.riskLevel === 'critical');
              if (criticalCustomers.length === 0) return null;
              
              return (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 border border-red-300 rounded-lg">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-sm font-bold text-red-900 uppercase tracking-wide">
                        Critical ({criticalCustomers.length})
                      </span>
                    </div>
                    <div className="h-px bg-red-200 flex-1" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {criticalCustomers.map((customer) => (
                      <div key={customer.id} onClick={() => onSelectCustomer(customer.id)} className="cursor-pointer hover:opacity-90 transition-opacity">
                        <AgentAssistView customer={customer} compact />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* High Priority Section */}
            {(() => {
              const highCustomers = filteredCustomers.filter(c => c.riskLevel === 'high');
              if (highCustomers.length === 0) return null;
              
              return (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-lg">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                        High Priority ({highCustomers.length})
                      </span>
                    </div>
                    <div className="h-px bg-amber-200 flex-1" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {highCustomers.map((customer) => (
                      <div key={customer.id} onClick={() => onSelectCustomer(customer.id)} className="cursor-pointer hover:opacity-90 transition-opacity">
                        <AgentAssistView customer={customer} compact />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Medium & Low Priority - Collapsed by default */}
            {(() => {
              const healthyCustomers = filteredCustomers.filter(c => c.riskLevel === 'medium' || c.riskLevel === 'low');
              if (healthyCustomers.length === 0) return null;
              
              return (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-300 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-bold text-green-900 uppercase tracking-wide">
                        Healthy ({healthyCustomers.length})
                      </span>
                    </div>
                    <div className="h-px bg-green-200 flex-1" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {healthyCustomers.map((customer) => (
                      <div key={customer.id} onClick={() => onSelectCustomer(customer.id)} className="cursor-pointer hover:opacity-90 transition-opacity">
                        <AgentAssistView customer={customer} compact />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;


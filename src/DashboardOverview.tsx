import { useMemo, useState } from 'react';
import type { Customer, RiskLevel, JourneyStage } from './types';
import ControlPanel from './ControlPanel';
import CreateCustomerModal from './CreateCustomerModal';

interface DashboardOverviewProps {
  customers: Customer[];
  onSelectCustomer: (customerId: string) => void;
}

type DashboardView = 'all' | 'at-risk' | 'opportunities';

const DashboardOverview = ({ customers, onSelectCustomer }: DashboardOverviewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<RiskLevel[]>([]);
  const [selectedStages, setSelectedStages] = useState<JourneyStage[]>([]);
  const [dashboardView, setDashboardView] = useState<DashboardView>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateCustomer = () => {
    setIsModalOpen(true);
  };

  const handleCustomerCreate = (customerData: Omit<Customer, 'id' | 'interactions'>) => {
    // In a real app, this would make an API call to create the customer
    console.log('Creating new customer:', customerData);
    // For now, just log the data - the parent component would handle actual creation
    alert(`Customer "${customerData.name}" created successfully!\n\nIn a production app, this would save to your database.`);
  };

  const handleToggleRiskLevel = (level: RiskLevel) => {
    setSelectedRiskLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const handleToggleStage = (stage: JourneyStage) => {
    setSelectedStages(prev =>
      prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRiskLevels([]);
    setSelectedStages([]);
  };

  const hasActiveFilters = searchQuery.length > 0 || selectedRiskLevels.length > 0 || selectedStages.length > 0;

  // Filter customers based on active filters
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Dashboard view filter (primary filter)
    if (dashboardView === 'at-risk') {
      filtered = filtered.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high');
    } else if (dashboardView === 'opportunities') {
      filtered = filtered.filter(c => {
        const trend = getHealthTrend(c);
        return trend === 'improving' || (c.healthScore >= 70 && c.riskLevel === 'low');
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(query));
    }

    // Risk level filter
    if (selectedRiskLevels.length > 0) {
      filtered = filtered.filter(c => selectedRiskLevels.includes(c.riskLevel));
    }

    // Stage filter
    if (selectedStages.length > 0) {
      filtered = filtered.filter(c => selectedStages.includes(c.stage as JourneyStage));
    }

    return filtered;
  }, [customers, searchQuery, selectedRiskLevels, selectedStages, dashboardView]);
  const metrics = useMemo(() => {
    const totalCustomers = customers.length;
    const atRisk = customers.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length;
    const totalMRR = customers.reduce((sum, c) => sum + c.mrr, 0);
    const avgHealth = customers.reduce((sum, c) => sum + c.healthScore, 0) / totalCustomers;

    return { totalCustomers, atRisk, totalMRR, avgHealth };
  }, [customers]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get card size based on risk level
  const getCardSizeClass = (riskLevel: RiskLevel) => {
    if (riskLevel === 'critical') return 'md:col-span-2 lg:col-span-2'; // Double width
    if (riskLevel === 'high') return 'md:col-span-2 lg:col-span-1'; // 1.5x on md
    return ''; // Normal size
  };

  // Get card urgency styling
  const getUrgencyClass = (riskLevel: RiskLevel) => {
    if (riskLevel === 'critical') return 'ring-2 ring-red-500 ring-offset-2 shadow-2xl shadow-red-200 animate-pulse-slow';
    if (riskLevel === 'high') return 'ring-2 ring-orange-400 ring-offset-1 shadow-xl shadow-orange-100';
    return '';
  };

  // Simulate health trend (in real app, would calculate from historical data)
  const getHealthTrend = (customer: Customer) => {
    // Simple simulation based on health score and risk
    if (customer.healthScore >= 80) return 'improving';
    if (customer.riskLevel === 'critical' || customer.riskLevel === 'high') return 'declining';
    if (customer.healthScore >= 60) return 'stable';
    return 'declining';
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    if (trend === 'improving') return { icon: '↗️', color: 'text-green-600', label: 'Improving' };
    if (trend === 'declining') return { icon: '↘️', color: 'text-red-600', label: 'Declining' };
    return { icon: '→', color: 'text-gray-500', label: 'Stable' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Intelligence</h1>
              <p className="text-gray-600 mt-1">Monitor customer health and engagement</p>
            </div>
          </div>
        </div>
      </header>

      {/* Metrics Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalCustomers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{metrics.atRisk}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total MRR</p>
                <p className="text-3xl font-bold text-green-600 mt-2">${metrics.totalMRR.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
                <p className={`text-3xl font-bold mt-2 ${getHealthColor(metrics.avgHealth)}`}>
                  {Math.round(metrics.avgHealth)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <ControlPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedRiskLevels={selectedRiskLevels}
          onToggleRiskLevel={handleToggleRiskLevel}
          selectedStages={selectedStages}
          onToggleStage={handleToggleStage}
          onClearFilters={handleClearFilters}
          onCreateCustomer={handleCreateCustomer}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Filter Results Summary */}
        {hasActiveFilters && (
          <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>
                Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> customers
              </span>
            </div>
          </div>
        )}

        {/* Dashboard View Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Customer Portfolio</h2>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setDashboardView('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  dashboardView === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  All Customers
                </span>
              </button>
              <button
                onClick={() => setDashboardView('at-risk')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  dashboardView === 'at-risk'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  At Risk ({customers.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high').length})
                </span>
              </button>
              <button
                onClick={() => setDashboardView('opportunities')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  dashboardView === 'opportunities'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Opportunities
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => {
            const trend = getHealthTrend(customer);
            const trendInfo = getTrendIcon(trend);
            
            return (
              <div
                key={customer.id}
                onClick={() => onSelectCustomer(customer.id)}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group ${getCardSizeClass(customer.riskLevel)} ${getUrgencyClass(customer.riskLevel)}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors ${
                      customer.riskLevel === 'critical' ? 'text-2xl' : 
                      customer.riskLevel === 'high' ? 'text-xl' : 'text-lg'
                    }`}>
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{customer.stage}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(customer.riskLevel)} ${
                    customer.riskLevel === 'critical' ? 'text-base px-4 py-2 animate-pulse' : ''
                  }`}>
                    {customer.riskLevel === 'critical' ? '🚨 ' : ''}{customer.riskLevel}
                  </span>
                </div>

                {/* Health Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Health Score</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl ${trendInfo.color}`} title={trendInfo.label}>
                        {trendInfo.icon}
                      </span>
                      <span className={`text-2xl font-bold ${getHealthColor(customer.healthScore)}`}>
                        {customer.healthScore}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        customer.healthScore >= 80 ? 'bg-green-500' :
                        customer.healthScore >= 60 ? 'bg-blue-500' :
                        customer.healthScore >= 40 ? 'bg-yellow-500' :
                        customer.healthScore >= 20 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${customer.healthScore}%` }}
                    />
                  </div>
                </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600">MRR</p>
                  <p className="text-lg font-bold text-gray-900">${customer.mrr.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Tenure</p>
                  <p className="text-lg font-bold text-gray-900">{customer.tenure}m</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Schedule call with', customer.name);
                  }}
                  className="action-btn flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 border border-blue-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Send email to', customer.name);
                  }}
                  className="action-btn flex-1 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 border border-purple-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCustomer(customer.id);
                  }}
                  className="action-btn flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 border border-gray-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Details
                </button>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {customer.lastContactDays}d ago
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {customer.assignedTo}
                </div>
              </div>

              {/* View Details Arrow */}
              <div className="mt-4 flex items-center justify-center text-blue-600 group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-medium mr-2">View Journey</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Create Customer Modal */}
      <CreateCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateCustomer={handleCustomerCreate}
      />
    </div>
  );
};

export default DashboardOverview;

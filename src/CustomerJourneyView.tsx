import { useState, useMemo } from 'react';
import type { Customer, JourneyEvent } from './types';
import EnhancedTimeline from './EnhancedTimeline';
import EventInspector from './EventInspector';
import CompactFilters from './CompactFilters';

interface CustomerJourneyViewProps {
  customer: Customer;
  onBack: () => void;
  onSwitchView?: () => void;
  initialQuickFilter?: string | null;
}

const CustomerJourneyView = ({ customer, onBack, onSwitchView, initialQuickFilter }: CustomerJourneyViewProps) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Apply initial quick filter if provided
  const initialFilteredEvents = useMemo(() => {
    if (!initialQuickFilter) return customer.interactions;
    return customer.interactions.filter(e => e.tags.includes(initialQuickFilter as never));
  }, [customer.interactions, initialQuickFilter]);
  
  const [filteredEvents, setFilteredEvents] = useState<JourneyEvent[]>(initialFilteredEvents);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return customer.interactions.find(e => e.id === selectedEventId) ?? null;
  }, [customer.interactions, selectedEventId]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header with Customer Info */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to dashboard"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                <p className="text-sm text-gray-600 mt-1">{customer.stage} • {customer.assignedTo}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {onSwitchView && (
                <button
                  onClick={onSwitchView}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  title="Switch to Horizontal Lifeline View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Lifeline View</span>
                </button>
              )}
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getRiskColor(customer.riskLevel)}`}>
                {customer.riskLevel.toUpperCase()} RISK
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Customer Health Metrics */}
      <div className="max-w-full px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Health Score</span>
              <span className={`text-2xl font-bold ${getHealthColor(customer.healthScore)}`}>
                {customer.healthScore}
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  customer.healthScore >= 80 ? 'bg-green-500' :
                  customer.healthScore >= 60 ? 'bg-blue-500' :
                  customer.healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${customer.healthScore}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <span className="text-sm font-medium text-gray-600">Monthly Revenue</span>
            <p className="text-2xl font-bold text-green-600 mt-1">${customer.mrr.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <span className="text-sm font-medium text-gray-600">Customer Tenure</span>
            <p className="text-2xl font-bold text-blue-600 mt-1">{customer.tenure} months</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <span className="text-sm font-medium text-gray-600">Last Contact</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{customer.lastContactDays}d ago</p>
          </div>
        </div>

        {/* Main Content: Three Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar: Filters */}
          <div className="col-span-3">
            <CompactFilters
              events={customer.interactions}
              onFilterChange={setFilteredEvents}
            />
          </div>

          {/* Center: Timeline */}
          <div className="col-span-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Customer Journey</h2>
                <span className="text-sm text-gray-600">{filteredEvents.length} events</span>
              </div>
              <EnhancedTimeline
                events={filteredEvents}
                selectedEventId={selectedEventId}
                onEventSelect={setSelectedEventId}
              />
            </div>
          </div>

          {/* Right: Event Details */}
          <div className="col-span-3">
            <EventInspector event={selectedEvent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerJourneyView;

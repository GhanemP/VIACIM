import { useState, useMemo, useEffect } from 'react';
import type { Customer } from './types';
import { generateDemoCustomers } from './demoDataEnhanced';
import DashboardOverview from './DashboardOverview';
import CustomerJourneyView from './CustomerJourneyView';
import CustomerLifelineView from './CustomerLifelineView';
import { trackEvent } from './telemetry';

type ViewMode = 'journey' | 'lifeline';

export default function CustomerIntelligenceDashboard() {
  const [customers] = useState<Customer[]>(generateDemoCustomers());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('journey');
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCustomerId) {
      trackEvent({ type: 'CUSTOMER_VIEW_CHANGED', payload: { customerId: selectedCustomerId } });
    }
  }, [selectedCustomerId]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find(c => c.id === selectedCustomerId) ?? null;
  }, [customers, selectedCustomerId]);

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleBackToDashboard = () => {
    setSelectedCustomerId(null);
  };

  const handleSwitchView = () => {
    setViewMode(prev => prev === 'journey' ? 'lifeline' : 'journey');
    trackEvent({ 
      type: 'FILTER_APPLY', 
      payload: { 
        filterType: 'viewMode', 
        value: viewMode === 'journey' ? 'lifeline' : 'journey' 
      } 
    });
  };

  const handleQuickFilter = (filter: string) => {
    setQuickFilter(prev => prev === filter ? null : filter);
    trackEvent({ type: 'FILTER_APPLY', payload: { filterType: 'quickFilter', value: filter } });
  };

  // Show overview when no customer selected, otherwise show selected view
  if (!selectedCustomer) {
    return (
      <DashboardOverview
        customers={customers}
        onSelectCustomer={handleSelectCustomer}
        quickFilter={quickFilter}
        onQuickFilter={handleQuickFilter}
      />
    );
  }

  // Render the selected view mode
  if (viewMode === 'lifeline') {
    return (
      <CustomerLifelineView
        customer={selectedCustomer}
        onBack={handleBackToDashboard}
        onSwitchView={handleSwitchView}
        initialQuickFilter={quickFilter}
      />
    );
  }

  return (
    <CustomerJourneyView
      customer={selectedCustomer}
      onBack={handleBackToDashboard}
      onSwitchView={handleSwitchView}
      initialQuickFilter={quickFilter}
    />
  );
}

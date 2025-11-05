import { useState, useMemo, useEffect } from 'react';
import type { Customer } from './types';
import { generateDemoCustomers } from './demoDataEnhanced';
import DashboardOverview from './DashboardOverview';
import CustomerJourneyView from './CustomerJourneyView';
import { trackEvent } from './telemetry';

export default function CustomerIntelligenceDashboard() {
  const [customers] = useState<Customer[]>(generateDemoCustomers());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

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

  // Show overview when no customer selected, otherwise show journey
  if (!selectedCustomer) {
    return (
      <DashboardOverview
        customers={customers}
        onSelectCustomer={handleSelectCustomer}
      />
    );
  }

  return (
    <CustomerJourneyView
      customer={selectedCustomer}
      onBack={handleBackToDashboard}
    />
  );
}

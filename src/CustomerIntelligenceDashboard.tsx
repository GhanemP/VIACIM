import { useEffect, useMemo, useState } from 'react';
import DashboardOverview from './DashboardOverview';
import CustomerLifelineView from './CustomerLifelineView';
import InsightsView from './InsightsView';
import { generateDemoCustomers } from './demoDataEnhanced';
import type { Customer } from './types';
import { trackEvent } from './telemetry';

type DashboardMode = 'overview' | 'insights';

export default function CustomerIntelligenceDashboard() {
  const [customers] = useState<Customer[]>(generateDemoCustomers());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('overview');
  const [pendingInsightId, setPendingInsightId] = useState<string | null>(null);

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
    setPendingInsightId(null);
    setDashboardMode('overview');
  };

  const handleViewInsights = (insightId?: string) => {
    setPendingInsightId(insightId ?? null);
    setDashboardMode('insights');
  };

  if (dashboardMode === 'insights') {
    return <InsightsView onBack={handleBackToDashboard} initialInsightId={pendingInsightId} />;
  }

  if (!selectedCustomer) {
    return (
      <DashboardOverview
        customers={customers}
        onSelectCustomer={handleSelectCustomer}
        onViewInsights={handleViewInsights}
      />
    );
  }

  return (
    <CustomerLifelineView
      customer={selectedCustomer}
      onBack={handleBackToDashboard}
      onOpenInsight={handleViewInsights}
    />
  );
}

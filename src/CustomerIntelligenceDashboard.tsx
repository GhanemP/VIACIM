import { useState, useMemo, useEffect } from 'react';
import type { Customer, JourneyEvent } from './types';
import { generateDemoCustomers } from './demoDataEnhanced';
import JourneyTimeline from './JourneyTimeline';
import InspectorPanel from './InspectorPanel';
import FilterControls from './FilterControls';
import { trackEvent } from './telemetry';

// Main dashboard component
export default function CustomerIntelligenceDashboard() {
  const [customers] = useState<Customer[]>(generateDemoCustomers());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0].id); // Default to first customer

  useEffect(() => {
    if (selectedCustomerId) {
      trackEvent({ type: 'CUSTOMER_VIEW_CHANGED', payload: { customerId: selectedCustomerId } });
    }
  }, [selectedCustomerId]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find(c => c.id === selectedCustomerId) ?? null;
  }, [customers, selectedCustomerId]);

  // Simple customer switcher for now
  const CustomerSwitcher = () => (
    <div className="absolute top-4 left-4 z-50 bg-white/70 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200">
       <label htmlFor="customer-switcher" className="text-sm font-medium text-gray-700 mr-2">Select Customer:</label>
      <select
        id="customer-switcher"
        title="Select Customer"
        aria-label="Select Customer"
        value={selectedCustomerId || ''}
        onChange={(e) => setSelectedCustomerId(e.target.value)}
        className="p-2 border border-gray-300 rounded-md text-sm"
      >
        {customers.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <CustomerSwitcher />
      {selectedCustomer ? (
        <CustomerJourneyView customer={selectedCustomer} />
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Please select a customer to view their journey.</p>
        </div>
      )}
    </div>
  );
}

// The new single-page view for a customer's journey
function CustomerJourneyView({ customer }: { customer: Customer }) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<JourneyEvent[]>(customer.interactions);

  useEffect(() => {
    if (selectedEventId) {
      trackEvent({ type: 'EVENT_INSPECTED', payload: { eventId: selectedEventId, customerId: customer.id } });
    }
  }, [selectedEventId, customer.id]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return customer.interactions.find(e => e.id === selectedEventId) ?? null;
  }, [customer.interactions, selectedEventId]);

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleCloseInspector = () => {
    setSelectedEventId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content: Timeline and Filters */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-8 overflow-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.name}</h1>
              <p className="text-gray-600">Customer Journey Timeline</p>
            </div>
            <div className="w-80">
              <FilterControls events={customer.interactions} onFilterChange={setFilteredEvents} />
            </div>
          </div>
          
          <div className="relative w-full h-[500px] bg-gray-100 border border-gray-200 rounded-lg">
            <JourneyTimeline events={filteredEvents} onEventSelect={handleEventSelect} />
          </div>
        </div>
      </main>

      {/* Side Panel: Inspector */}
      <aside className={`absolute top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl transition-transform duration-300 ease-in-out ${selectedEventId ? 'translate-x-0' : 'translate-x-full'}`}>
        <InspectorPanel event={selectedEvent} onClose={handleCloseInspector} />
      </aside>
    </div>
  );
}

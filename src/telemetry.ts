// --- Simple Telemetry Service ---
// In a real-world application, this would integrate with a service
// like Application Insights, Mixpanel, Amplitude, etc.

type TelemetryEvent =
  | { type: 'CUSTOMER_VIEW_CHANGED'; payload: { customerId: string } }
  | { type: 'EVENT_INSPECTED'; payload: { eventId: string; customerId: string } }
  | { type: 'FILTER_SEARCH_USED'; payload: { searchTerm: string } }
  | { type: 'FILTER_CHANNEL_CHANGED'; payload: { selectedChannels: string[] } }
  | { type: 'TIMELINE_ZOOM_PAN'; payload: { transform: { k: number; x: number; y: number } } };

export const trackEvent = (event: TelemetryEvent) => {
  // For now, we just log to the console.
  console.log('[Telemetry]', event.type, event.payload);
};

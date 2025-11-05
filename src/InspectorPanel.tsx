import type { JourneyEvent } from './types';
import React from 'react';

interface InspectorPanelProps {
  event: JourneyEvent | null;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900 mt-1 col-span-2">{value}</dd>
  </>
);

const InspectorPanel: React.FC<InspectorPanelProps> = ({ event, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Event Details</h2>
        <button onClick={onClose} title="Close panel" className="p-2 rounded-md hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {event ? (
          <div className="p-4">
            <dl className="grid grid-cols-3 gap-x-4 gap-y-6">
              <DetailRow label="ID" value={event.id} />
              <DetailRow label="Title" value={event.title} />
              <DetailRow label="Timestamp" value={new Date(event.ts).toLocaleString()} />
              <DetailRow label="Stage" value={event.stage} />
              <DetailRow label="Channel" value={event.channel} />
              <DetailRow label="Summary" value={event.summary} />
              <DetailRow label="Duration" value={`${event.durationSec}s`} />
              <DetailRow label="Agent" value={event.agent} />
              <DetailRow label="Customer" value={event.customer} />
              <DetailRow label="Risk Score" value={event.score.risk} />
              <DetailRow label="Opportunity Score" value={event.score.opportunity} />
              <DetailRow label="Sentiment" value={event.sentiment} />
              <DetailRow label="Tags" value={event.tags.join(', ')} />
            </dl>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>Select an event from the timeline to see details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectorPanel;

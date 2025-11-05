import type { JourneyEvent, JourneyStage } from './types';
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface JourneyTimelineProps {
  events: JourneyEvent[];
  onEventSelect: (eventId: string) => void;
}

const STAGE_COLORS: Record<JourneyStage, string> = {
  Acquisition: '#A78BFA', // violet-400
  Onboarding: '#3B82F6', // blue-500
  Support: '#10B981', // emerald-500
  Renewal: '#F59E0B', // amber-500
};

const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ events, onEventSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [width, setWidth] = useState(800);
  const height = 200;
  const margin = { top: 20, right: 50, bottom: 50, left: 50 };

  // Sort events by timestamp ascending
  const sortedEvents = [...events].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const xScale = d3.scaleTime()
    .domain(d3.extent(sortedEvents, d => new Date(d.ts)) as [Date, Date])
    .range([margin.left, width - margin.right]);

  const rescaledX = transform.rescaleX(xScale);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10]) // Min/max zoom levels
      .extent([[0, 0], [width, height]])
      .translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]])
      .on('zoom', (event) => {
        setTransform(event.transform);
      });

    svg.call(zoom);

  }, [width, height, margin.left, margin.right]);

  // --- Gap and Stage Calculation ---
  const significantGapThreshold = 14 * 24 * 60 * 60 * 1000; // 14 days
  const gaps: Array<{ id: string; start: Date; end: Date; days: number }> = [];
  const stageBoundaries: Array<{ stage: JourneyStage; start: Date; end: Date }> = [];

  if (sortedEvents.length > 0) {
    // Calculate Gaps
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEventTs = new Date(sortedEvents[i].ts).getTime();
      const nextEventTs = new Date(sortedEvents[i + 1].ts).getTime();
      const gapDuration = nextEventTs - currentEventTs;

      if (gapDuration > significantGapThreshold) {
        gaps.push({
          id: `gap-${i}`,
          start: new Date(currentEventTs),
          end: new Date(nextEventTs),
          days: Math.round(gapDuration / (1000 * 60 * 60 * 24)),
        });
      }
    }

    // Calculate Stage Boundaries
    const eventsByStage = d3.group(sortedEvents, d => d.stage);
    for (const [stage, stageEvents] of eventsByStage.entries()) {
      const timestamps = stageEvents.map(e => new Date(e.ts).getTime());
      stageBoundaries.push({
        stage,
        start: new Date(Math.min(...timestamps)),
        end: new Date(Math.max(...timestamps)),
      });
    }
  }


  if (!sortedEvents.length) {
    return <div className="text-center text-gray-500 p-8">No journey events to display.</div>;
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <svg 
        ref={svgRef} 
        width={width} 
        height={height} 
        className="cursor-grab active:cursor-grabbing"
        role="application"
        aria-label="Interactive customer journey timeline. Use arrow keys to pan and +/- keys to zoom."
      >
        <g>
          {/* Stage Backgrounds */}
          {stageBoundaries.map(({ stage, start, end }) => (
            <rect
              key={stage}
              x={rescaledX(start)}
              y={height / 2 - 20}
              width={rescaledX(end) - rescaledX(start) || 1}
              height={40}
              fill={STAGE_COLORS[stage]}
              opacity={0.1}
              aria-label={`Stage: ${stage}`}
            />
          ))}

          {/* Gap Indicators */}
          {gaps.map(gap => (
            <g key={gap.id} className="gap-indicator" role="note" aria-label={`Engagement gap of ${gap.days} days`}>
              <rect
                x={rescaledX(gap.start)}
                y={height / 2 - 10}
                width={rescaledX(gap.end) - rescaledX(gap.start)}
                height={20}
                fill="#fefce8"
                stroke="#facc15"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text
                x={rescaledX(gap.start) + (rescaledX(gap.end) - rescaledX(gap.start)) / 2}
                y={height / 2 + 4}
                textAnchor="middle"
                fontSize="9"
                fill="#ca8a04"
                className="font-bold pointer-events-none"
              >
                {gap.days}d
              </text>
            </g>
          ))}

          {/* Timeline Axis */}
          <line
            x1={rescaledX.range()[0]}
            y1={height / 2}
            x2={rescaledX.range()[1]}
            y2={height / 2}
            stroke="#9ca3af"
            strokeWidth="1"
          />

          {/* Event Markers */}
          {sortedEvents.map((event) => (
            <g
              key={event.id}
              transform={`translate(${rescaledX(new Date(event.ts))}, ${height / 2})`}
              onClick={() => onEventSelect(event.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onEventSelect(event.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Event: ${event.title} on ${new Date(event.ts).toLocaleDateString()}`}
              className="cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full"
            >
              <circle
                r="8"
                fill={STAGE_COLORS[event.stage]}
                stroke="white"
                strokeWidth="3"
                className="group-hover:opacity-80 transition-opacity"
              />
              <title>{`Event: ${event.title}`}</title>
              <text
                y="-20"
                textAnchor="middle"
                fontSize="10"
                className="fill-gray-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              >
                {event.title}
              </text>
            </g>
          ))}
        </g>
      </svg>
       <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button 
          aria-label="Zoom in"
          className="px-2 py-1 bg-gray-200 rounded text-xs" onClick={() => {
          if (!svgRef.current) return;
          const svg = d3.select(svgRef.current);
          svg.transition().duration(250).call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1.2);
        }}>+</button>
        <button 
          aria-label="Zoom out"
          className="px-2 py-1 bg-gray-200 rounded text-xs" onClick={() => {
          if (!svgRef.current) return;
          const svg = d3.select(svgRef.current);
          svg.transition().duration(250).call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 0.8);
        }}>-</button>
         <button 
          aria-label="Reset zoom"
          className="px-2 py-1 bg-gray-200 rounded text-xs" onClick={() => {
          if (!svgRef.current) return;
          const svg = d3.select(svgRef.current);
          svg.transition().duration(750).call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity);
        }}>Reset</button>
      </div>
    </div>
  );
};

export default JourneyTimeline;

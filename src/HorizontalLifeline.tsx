import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3-zoom';
import { scaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import type { JourneyEvent, EventCluster, ChannelType, TagType, PriorityLevel } from './types';

interface HorizontalLifelineProps {
  events: JourneyEvent[];
  selectedEventId: string | null;
  onEventSelect: (eventId: string | null) => void;
  height?: number;
}

// S4: Marker encoding configuration
const MARKER_CONFIG = {
  shapes: {
    voice: 'circle',
    email: 'square',
    chat: 'diamond',
    crm: 'triangle',
  } as Record<ChannelType, string>,

  colors: {
    // Priority-based colors (S4 requirement)
    critical: '#dc2626', // red-600
    high: '#ea580c', // orange-600
    medium: '#f59e0b', // amber-500
    low: '#3b82f6', // blue-500
    none: '#6b7280', // gray-500
  } as Record<PriorityLevel, string>,

  tagColors: {
    risk: '#ef4444', // red-500
    opportunity: '#10b981', // green-500
    flag: '#f59e0b', // amber-500
    compliance: '#8b5cf6', // violet-500
  } as Record<TagType, string>,
};

// S5: Clustering threshold
const CLUSTER_THRESHOLD = 500; // pixels - cluster if markers closer than this

const HorizontalLifeline = ({
  events,
  selectedEventId,
  onEventSelect,
  height = 400
}: HorizontalLifelineProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height });
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const [hoveredEvent, setHoveredEvent] = useState<JourneyEvent | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: height
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [height]);

  // Sort events chronologically
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) =>
      new Date(a.ts).getTime() - new Date(b.ts).getTime()
    );
  }, [events]);

  // Time scale for x-axis
  const timeExtent = useMemo(() => {
    if (sortedEvents.length === 0) return [new Date(), new Date()];
    const times = sortedEvents.map(e => new Date(e.ts));
    return [new Date(Math.min(...times.map(d => d.getTime()))),
            new Date(Math.max(...times.map(d => d.getTime())))];
  }, [sortedEvents]);

  const margin = { top: 60, right: 50, bottom: 60, left: 50 };
  const innerWidth = dimensions.width - margin.left - margin.right;
  const innerHeight = dimensions.height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return scaleTime()
      .domain(timeExtent as [Date, Date])
      .range([0, innerWidth]);
  }, [timeExtent, innerWidth]);

  // Transform scale with zoom
  const xScaleZoomed = transform.rescaleX(xScale);

  // S5: Clustering logic
  const { clusters, individualEvents } = useMemo(() => {
    if (sortedEvents.length === 0) {
      return { clusters: [] as EventCluster[], individualEvents: [] as JourneyEvent[] };
    }

    const clusters: EventCluster[] = [];
    const individual: JourneyEvent[] = [];
    const processed = new Set<string>();

    sortedEvents.forEach((event, i) => {
      if (processed.has(event.id)) return;

      const x1 = xScaleZoomed(new Date(event.ts));
      const nearby: JourneyEvent[] = [event];

      // Find nearby events within threshold
      for (let j = i + 1; j < sortedEvents.length; j++) {
        const other = sortedEvents[j];
        const x2 = xScaleZoomed(new Date(other.ts));

        if (Math.abs(x2 - x1) < CLUSTER_THRESHOLD && !processed.has(other.id)) {
          nearby.push(other);
          processed.add(other.id);
        } else if (x2 - x1 > CLUSTER_THRESHOLD) {
          break; // Events are sorted, no need to check further
        }
      }

      processed.add(event.id);

      if (nearby.length >= 3) {
        // Create cluster
        const timestamps = nearby.map(e => new Date(e.ts).getTime());
        const avgTime = timestamps.reduce((a, b) => a + b, 0) / timestamps.length;

        // Determine dominant tag and channel
        const tagCounts = new Map<TagType, number>();
        const channelCounts = new Map<ChannelType, number>();

        nearby.forEach(e => {
          e.tags.forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
          channelCounts.set(e.channel, (channelCounts.get(e.channel) || 0) + 1);
        });

        const dominantTag = Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'flag';
        const dominantChannel = Array.from(channelCounts.entries())
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'voice';

        clusters.push({
          id: `cluster-${event.id}`,
          events: nearby,
          centroid: new Date(avgTime),
          dominantTag,
          dominantChannel,
          bounds: {
            start: new Date(Math.min(...timestamps)),
            end: new Date(Math.max(...timestamps))
          }
        });
      } else {
        // Individual events
        individual.push(...nearby);
      }
    });

    return { clusters, individualEvents: individual };
  }, [sortedEvents, xScaleZoomed]);

  // Setup zoom behavior (S3)
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 20])
      .translateExtent([[0, 0], [dimensions.width, dimensions.height]])
      .on('zoom', (event) => {
        setTransform(event.transform);
      });

    svg.call(zoom);

    return () => {
      svg.on('.zoom', null);
    };
  }, [dimensions]);

  // S4: Render marker shape
  const renderMarker = (
    channel: ChannelType,
    x: number,
    y: number,
    priority: PriorityLevel,
    size: number,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    const color = MARKER_CONFIG.colors[priority];
    const shape = MARKER_CONFIG.shapes[channel];
    const actualSize = size * (isSelected ? 1.5 : isHovered ? 1.3 : 1);
    const strokeWidth = isSelected ? 3 : isHovered ? 2 : 1;

    switch (shape) {
      case 'circle':
        return (
          <circle
            cx={x}
            cy={y}
            r={actualSize}
            fill={color}
            stroke="white"
            strokeWidth={strokeWidth}
            className="transition-all cursor-pointer"
          />
        );
      case 'square':
        return (
          <rect
            x={x - actualSize}
            y={y - actualSize}
            width={actualSize * 2}
            height={actualSize * 2}
            fill={color}
            stroke="white"
            strokeWidth={strokeWidth}
            className="transition-all cursor-pointer"
          />
        );
      case 'diamond':
        return (
          <path
            d={`M ${x},${y - actualSize} L ${x + actualSize},${y} L ${x},${y + actualSize} L ${x - actualSize},${y} Z`}
            fill={color}
            stroke="white"
            strokeWidth={strokeWidth}
            className="transition-all cursor-pointer"
          />
        );
      case 'triangle':
        return (
          <path
            d={`M ${x},${y - actualSize} L ${x + actualSize},${y + actualSize} L ${x - actualSize},${y + actualSize} Z`}
            fill={color}
            stroke="white"
            strokeWidth={strokeWidth}
            className="transition-all cursor-pointer"
          />
        );
      default:
        return null;
    }
  };

  const handleEventClick = (eventId: string) => {
    onEventSelect(eventId === selectedEventId ? null : eventId);
  };

  const handleEventHover = (event: JourneyEvent | null, clientX: number, clientY: number) => {
    setHoveredEvent(event);
    if (event) {
      setTooltipPos({ x: clientX, y: clientY });
    }
  };

  // Empty state
  if (sortedEvents.length === 0) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No journey data</h3>
          <p className="mt-1 text-sm text-gray-500">No events to display on the timeline.</p>
        </div>
      </div>
    );
  }

  const centerY = innerHeight / 2;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white rounded-lg border border-gray-200">
      {/* Timeline Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="cursor-move"
        role="application"
        aria-label="Customer journey timeline. Drag to pan, scroll to zoom."
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Main timeline axis */}
          <line
            x1={0}
            y1={centerY}
            x2={innerWidth}
            y2={centerY}
            stroke="#d1d5db"
            strokeWidth={2}
          />

          {/* Time axis ticks */}
          {xScaleZoomed.ticks(10).map((tick, i) => {
            const x = xScaleZoomed(tick);
            if (x < 0 || x > innerWidth) return null;

            return (
              <g key={i} transform={`translate(${x}, ${centerY})`}>
                <line y1={-5} y2={5} stroke="#9ca3af" strokeWidth={1} />
                <text
                  y={25}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#6b7280"
                  fontWeight={500}
                >
                  {tick.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </text>
              </g>
            );
          })}

          {/* Render clusters */}
          {clusters.map((cluster) => {
            const x = xScaleZoomed(cluster.centroid);
            if (x < -50 || x > innerWidth + 50) return null;

            const color = MARKER_CONFIG.tagColors[cluster.dominantTag];
            const hasSelectedEvent = cluster.events.some(e => e.id === selectedEventId);

            return (
              <g
                key={cluster.id}
                transform={`translate(${x}, ${centerY})`}
                onClick={() => {
                  // On cluster click, select first event in cluster
                  handleEventClick(cluster.events[0].id);
                }}
                className="cursor-pointer"
              >
                {/* Cluster circle */}
                <circle
                  r={20}
                  fill={color}
                  fillOpacity={0.2}
                  stroke={color}
                  strokeWidth={hasSelectedEvent ? 3 : 2}
                  className="transition-all"
                />
                {/* Event count badge */}
                <circle r={12} fill={color} />
                <text
                  textAnchor="middle"
                  dy={4}
                  fontSize={11}
                  fontWeight="bold"
                  fill="white"
                >
                  {cluster.events.length}
                </text>
              </g>
            );
          })}

          {/* Render individual events */}
          {individualEvents.map((event) => {
            const x = xScaleZoomed(new Date(event.ts));
            if (x < -50 || x > innerWidth + 50) return null;

            const isSelected = event.id === selectedEventId;
            const isHovered = hoveredEvent?.id === event.id;
            const size = 6 + (event.weight / 20); // Size based on weight

            return (
              <g
                key={event.id}
                transform={`translate(${x}, ${centerY})`}
                onClick={() => handleEventClick(event.id)}
                onMouseEnter={(e) => handleEventHover(event, e.clientX, e.clientY)}
                onMouseLeave={() => handleEventHover(null, 0, 0)}
              >
                {renderMarker(
                  event.channel,
                  0,
                  0,
                  event.priority,
                  size,
                  isSelected,
                  isHovered
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-md border border-gray-200 p-2">
        <button
          onClick={() => {
            if (!svgRef.current) return;
            const svg = select(svgRef.current);
            svg.transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1.3);
          }}
          className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => {
            if (!svgRef.current) return;
            const svg = select(svgRef.current);
            svg.transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 0.7);
          }}
          className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => {
            if (!svgRef.current) return;
            const svg = select(svgRef.current);
            svg.transition().duration(500).call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity);
          }}
          className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
          aria-label="Fit to lifetime"
          title="Fit to lifetime"
        >
          ⊙
        </button>
      </div>

      {/* Tooltip */}
      {hoveredEvent && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 max-w-xs pointer-events-none"
          style={{
            left: tooltipPos.x + 10,
            top: tooltipPos.y + 10,
          }}
        >
          <div className="font-bold mb-1">{hoveredEvent.title}</div>
          <div className="text-gray-300 mb-2">{new Date(hoveredEvent.ts).toLocaleString()}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="capitalize">{hoveredEvent.channel}</span>
            <span>•</span>
            <span>{hoveredEvent.stage}</span>
            <span>•</span>
            <span>{hoveredEvent.durationSec}s</span>
          </div>
          {(hoveredEvent.score.risk > 50 || hoveredEvent.score.opportunity > 50) && (
            <div className="mt-2 pt-2 border-t border-gray-700 text-xs">
              {hoveredEvent.score.risk > 50 && (
                <div className="text-red-400">⚠️ Risk: {hoveredEvent.score.risk}</div>
              )}
              {hoveredEvent.score.opportunity > 50 && (
                <div className="text-green-400">✨ Opportunity: {hoveredEvent.score.opportunity}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md border border-gray-200 p-3">
        <div className="text-xs font-bold text-gray-700 mb-2">Channels</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#6b7280" /></svg>
            <span>Voice</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="12" height="12"><rect x="1" y="1" width="10" height="10" fill="#6b7280" /></svg>
            <span>Email</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="12" height="12"><path d="M6,1 L11,6 L6,11 L1,6 Z" fill="#6b7280" /></svg>
            <span>Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="12" height="12"><path d="M6,1 L11,11 L1,11 Z" fill="#6b7280" /></svg>
            <span>CRM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalLifeline;

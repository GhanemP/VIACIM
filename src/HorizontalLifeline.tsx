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

// S4: Marker encoding configuration - ENHANCED for v1.5
const MARKER_CONFIG = {
  shapes: {
    voice: 'circle',
    email: 'square',
    chat: 'diamond',
    crm: 'triangle',
  } as Record<ChannelType, string>,

  colors: {
    // Priority-based colors (S4 requirement) - Enhanced contrast
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
  
  // v1.5: Enhanced event type shapes for better differentiation
  eventTypeShapes: {
    risk: 'warning-triangle',
    opportunity: 'star',
    normal: 'circle',
    compliance: 'hexagon',
  },
};

// S5: Clustering threshold
const CLUSTER_THRESHOLD = 500; // pixels - cluster if markers closer than this

const SCORE_WIDTH_CLASSES: Record<number, string> = {
  0: 'w-[0%]',
  5: 'w-[5%]',
  10: 'w-[10%]',
  15: 'w-[15%]',
  20: 'w-[20%]',
  25: 'w-[25%]',
  30: 'w-[30%]',
  35: 'w-[35%]',
  40: 'w-[40%]',
  45: 'w-[45%]',
  50: 'w-[50%]',
  55: 'w-[55%]',
  60: 'w-[60%]',
  65: 'w-[65%]',
  70: 'w-[70%]',
  75: 'w-[75%]',
  80: 'w-[80%]',
  85: 'w-[85%]',
  90: 'w-[90%]',
  95: 'w-[95%]',
  100: 'w-[100%]',
};

const getScoreWidthClass = (value: number) => {
  const clamped = Math.min(100, Math.max(0, Math.round(value / 5) * 5));
  return SCORE_WIDTH_CLASSES[clamped] ?? 'w-[0%]';
};

const HorizontalLifeline = ({
  events,
  selectedEventId,
  onEventSelect,
  height = 400
}: HorizontalLifelineProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.setProperty('--tooltip-x', `${tooltipPos.x + 10}px`);
    tooltipRef.current.style.setProperty('--tooltip-y', `${tooltipPos.y + 10}px`);
  }, [tooltipPos]);

  // v1.5: Enhanced marker rendering with better shapes and visual effects
  const renderMarker = (
    event: JourneyEvent,
    x: number,
    y: number,
    size: number,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    const channel = event.channel;
    const priority = event.priority;
    const hasRisk = event.tags.includes('risk') || event.score.risk > 60;
    const hasOpportunity = event.tags.includes('opportunity') || event.score.opportunity > 60;
    
    // Determine primary color based on tags/scores
    let color = MARKER_CONFIG.colors[priority];
    let shape = MARKER_CONFIG.shapes[channel];
    
    // Override shape for special event types
    if (hasRisk) {
      shape = 'warning-triangle';
      color = MARKER_CONFIG.tagColors.risk;
    } else if (hasOpportunity) {
      shape = 'star';
      color = MARKER_CONFIG.tagColors.opportunity;
    }
    
    const actualSize = size * (isSelected ? 1.6 : isHovered ? 1.4 : 1);
    const strokeWidth = isSelected ? 3 : isHovered ? 2.5 : 1.5;
    
    // Add glow effect for high-risk events
    const glowId = `glow-${event.id}`;

    return (
      <g>
        {hasRisk && (
          <defs>
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        )}
        
        {/* Render shape based on type */}
        {shape === 'warning-triangle' && (
          <path
            d={`M ${x},${y - actualSize * 1.2} L ${x + actualSize},${y + actualSize * 0.6} L ${x - actualSize},${y + actualSize * 0.6} Z`}
            fill={color}
            stroke="white"
            strokeWidth={strokeWidth}
            filter={hasRisk ? `url(#${glowId})` : undefined}
            className="transition-all cursor-pointer"
          >
            <animate
              attributeName="opacity"
              values={hasRisk ? "1;0.6;1" : "1"}
              dur={hasRisk ? "2s" : "0s"}
              repeatCount="indefinite"
            />
          </path>
        )}
        
        {shape === 'star' && (
          <path
            d={`M ${x},${y - actualSize} 
                L ${x + actualSize * 0.3},${y - actualSize * 0.3} 
                L ${x + actualSize},${y - actualSize * 0.3}
                L ${x + actualSize * 0.5},${y + actualSize * 0.1}
                L ${x + actualSize * 0.7},${y + actualSize}
                L ${x},${y + actualSize * 0.5}
                L ${x - actualSize * 0.7},${y + actualSize}
                L ${x - actualSize * 0.5},${y + actualSize * 0.1}
                L ${x - actualSize},${y - actualSize * 0.3}
                L ${x - actualSize * 0.3},${y - actualSize * 0.3} Z`}
            fill={color}
            stroke="white"
            strokeWidth={strokeWidth}
            className="transition-all cursor-pointer"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${x} ${y}`}
              to={`360 ${x} ${y}`}
              dur="20s"
              repeatCount="indefinite"
            />
          </path>
        )}
        
        {shape === 'circle' && (
          <circle
            cx={x}
            cy={y}
            r={actualSize}
            fill={color}
            stroke="white"
            strokeWidth={strokeWidth}
            className="transition-all cursor-pointer"
          />
        )}
        
        {shape === 'square' && (
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
        )}
        
        {shape === 'diamond' && (
          <path
            d={`M ${x},${y - actualSize} L ${x + actualSize},${y} L ${x},${y + actualSize} L ${x - actualSize},${y} Z`}
            fill={color}
            stroke="white"
            strokeWidth={strokeWidth}
            className="transition-all cursor-pointer"
          />
        )}
        
        {shape === 'triangle' && (
          <path
            d={`M ${x},${y - actualSize} L ${x + actualSize},${y + actualSize} L ${x - actualSize},${y + actualSize} Z`}
            fill={color}
            stroke="white"
            strokeWidth={strokeWidth}
            className="transition-all cursor-pointer"
          />
        )}
      </g>
    );
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
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-lg border border-gray-200 bg-gradient-to-br from-white via-slate-50 to-sky-50 shadow-lg overflow-hidden"
    >
      {/* Timeline Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="cursor-move"
        role="application"
        aria-label="Customer journey timeline. Drag to pan, scroll to zoom."
      >
          <defs>
            <linearGradient id="lifelineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#ede9fe" />
            </linearGradient>
            <radialGradient id="lifelineGlow" cx="50%" cy="0%" r="75%">
              <stop offset="0%" stopColor="rgba(14,165,233,0.25)" />
              <stop offset="40%" stopColor="rgba(59,130,246,0.12)" />
              <stop offset="100%" stopColor="rgba(14,116,144,0)" />
            </radialGradient>
            <pattern id="lifelineGrid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M36 0H0v36" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="1" />
              <path d="M18 0v36" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="0.5" />
              <path d="M0 18h36" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lifelineGradient)" />
        <rect width="100%" height="100%" fill="url(#lifelineGrid)" />
        <rect width="100%" height={dimensions.height / 3} fill="url(#lifelineGlow)" opacity={0.6} />
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Main timeline axis */}
          <line
            x1={0}
            y1={centerY}
            x2={innerWidth}
            y2={centerY}
            stroke="rgba(148, 163, 184, 0.35)"
            strokeWidth={2}
          />

          {/* Time axis ticks */}
          {xScaleZoomed.ticks(10).map((tick, i) => {
            const x = xScaleZoomed(tick);
            if (x < 0 || x > innerWidth) return null;

            return (
              <g key={i} transform={`translate(${x}, ${centerY})`}>
                <line y1={-6} y2={6} stroke="rgba(148, 163, 184, 0.35)" strokeWidth={1} />
                <text
                  y={25}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#cbd5f5"
                  fontWeight={600}
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

          {/* v1.5: Journey progress line connecting events */}
          {sortedEvents.length > 1 && (
            <g>
              {sortedEvents.map((event, i) => {
                if (i === sortedEvents.length - 1) return null;
                
                const x1 = xScaleZoomed(new Date(event.ts));
                const x2 = xScaleZoomed(new Date(sortedEvents[i + 1].ts));
                
                if (x2 < -50 || x1 > innerWidth + 50) return null;
                
                // Calculate gap duration in days
                const gapDays = (new Date(sortedEvents[i + 1].ts).getTime() - new Date(event.ts).getTime()) / (1000 * 60 * 60 * 24);
                const isLargeGap = gapDays > 7;
                
                // Color gradient based on health/activity
                const avgRisk = (event.score.risk + sortedEvents[i + 1].score.risk) / 2;
                let lineColor = '#10b981'; // green
                if (avgRisk > 60) lineColor = '#ef4444'; // red
                else if (avgRisk > 40) lineColor = '#f59e0b'; // amber
                
                return (
                  <g key={`line-${i}`}>
                    <line
                      x1={x1}
                      y1={centerY}
                      x2={x2}
                      y2={centerY}
                      stroke={lineColor}
                      strokeWidth={isLargeGap ? 1 : 2}
                      strokeDasharray={isLargeGap ? "5,5" : "none"}
                      opacity={isLargeGap ? 0.3 : 0.6}
                      className="transition-all"
                    />
                    
                    {/* Gap indicator for significant gaps */}
                    {isLargeGap && gapDays > 14 && (
                      <g transform={`translate(${(x1 + x2) / 2}, ${centerY})`}>
                        {/* Gap background */}
                        <rect
                          x={-30}
                          y={-30}
                          width={60}
                          height={25}
                          rx={4}
                          fill="#fef3c7"
                          fillOpacity={0.9}
                          stroke="#f59e0b"
                          strokeWidth={1}
                        />
                        {/* Gap text */}
                        <text
                          textAnchor="middle"
                          dy={-15}
                          fontSize={10}
                          fontWeight="600"
                          fill="#92400e"
                        >
                          {Math.round(gapDays)}d gap
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Render individual events */}
          {individualEvents.map((event) => {
            const x = xScaleZoomed(new Date(event.ts));
            if (x < -50 || x > innerWidth + 50) return null;

            const isSelected = event.id === selectedEventId;
            const isHovered = hoveredEvent?.id === event.id;
            const size = 8 + (event.weight / 15); // Larger base size for v1.5

            return (
              <g
                key={event.id}
                transform={`translate(${x}, ${centerY})`}
                onClick={() => handleEventClick(event.id)}
                onMouseEnter={(e) => handleEventHover(event, e.clientX, e.clientY)}
                onMouseLeave={() => handleEventHover(null, 0, 0)}
              >
                {renderMarker(
                  event,
                  0,
                  0,
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

      {/* Enhanced Tooltip v1.5 */}
      {hoveredEvent && (
        <div
          ref={tooltipRef}
          className="lifeline-tooltip z-50 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-xs rounded-xl shadow-2xl p-4 max-w-sm pointer-events-none border border-gray-700"
        >
          <div className="font-bold text-sm mb-2 flex items-start gap-2">
            {hoveredEvent.tags.includes('risk') && <span className="text-red-400 text-base">⚠️</span>}
            {hoveredEvent.tags.includes('opportunity') && <span className="text-green-400 text-base">✨</span>}
            <span className="flex-1">{hoveredEvent.title}</span>
          </div>
          
          <div className="text-gray-300 text-xs mb-3">
            {new Date(hoveredEvent.ts).toLocaleDateString(undefined, { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          
          {hoveredEvent.summary && (
            <div className="text-gray-200 text-xs mb-3 leading-relaxed">
              {hoveredEvent.summary}
            </div>
          )}
          
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span className="capitalize flex items-center gap-1">
              📱 {hoveredEvent.channel}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              📊 {hoveredEvent.stage}
            </span>
            {hoveredEvent.durationSec > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  ⏱️ {Math.round(hoveredEvent.durationSec / 60)}m
                </span>
              </>
            )}
          </div>
          
          {(hoveredEvent.score.risk > 30 || hoveredEvent.score.opportunity > 30) && (
            <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
              {hoveredEvent.score.risk > 30 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Risk Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`${getScoreWidthClass(hoveredEvent.score.risk)} h-full rounded-full ${
                          hoveredEvent.score.risk > 70 ? 'bg-red-500' :
                          hoveredEvent.score.risk > 40 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-bold text-red-400 w-6 text-right">
                      {hoveredEvent.score.risk}
                    </span>
                  </div>
                </div>
              )}
              {hoveredEvent.score.opportunity > 30 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Opportunity</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`${getScoreWidthClass(hoveredEvent.score.opportunity)} h-full bg-green-500 rounded-full`}
                      />
                    </div>
                    <span className="text-xs font-bold text-green-400 w-6 text-right">
                      {hoveredEvent.score.opportunity}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {hoveredEvent.tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap gap-1">
              {hoveredEvent.tags.map(tag => (
                <span 
                  key={tag}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    tag === 'risk' ? 'bg-red-500/20 text-red-300' :
                    tag === 'opportunity' ? 'bg-green-500/20 text-green-300' :
                    tag === 'flag' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-purple-500/20 text-purple-300'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Legend v1.5 */}
      <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
        <div className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span>Timeline Guide</span>
        </div>
        
        {/* Event Types */}
        <div className="mb-3">
          <div className="text-xs font-semibold text-gray-700 mb-2">Event Types</div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <svg width="16" height="16">
                <path d="M8,2 L14,12 L2,12 Z" fill="#ef4444" stroke="white" strokeWidth="1.5"/>
              </svg>
              <span className="font-medium text-red-600">Risk Event</span>
              <span className="text-gray-400">(pulsing)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16">
                <path d="M8,1 L10,6 L15,6 L11,9 L13,14 L8,11 L3,14 L5,9 L1,6 L6,6 Z" fill="#10b981" stroke="white" strokeWidth="1.5"/>
              </svg>
              <span className="font-medium text-green-600">Opportunity</span>
              <span className="text-gray-400">(rotating)</span>
            </div>
          </div>
        </div>
        
        {/* Channels */}
        <div className="mb-3 pb-3 border-b border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-2">Channels</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <svg width="14" height="14"><circle cx="7" cy="7" r="5" fill="#6b7280" stroke="white" strokeWidth="1.5"/></svg>
              <span>Voice</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14"><rect x="2" y="2" width="10" height="10" fill="#6b7280" stroke="white" strokeWidth="1.5"/></svg>
              <span>Email</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14"><path d="M7,2 L12,7 L7,12 L2,7 Z" fill="#6b7280" stroke="white" strokeWidth="1.5"/></svg>
              <span>Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14"><path d="M7,2 L12,12 L2,12 Z" fill="#6b7280" stroke="white" strokeWidth="1.5"/></svg>
              <span>CRM</span>
            </div>
          </div>
        </div>
        
        {/* Journey Line */}
        <div>
          <div className="text-xs font-semibold text-gray-700 mb-2">Journey Flow</div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <svg width="30" height="4">
                <line x1="0" y1="2" x2="30" y2="2" stroke="#10b981" strokeWidth="2"/>
              </svg>
              <span>Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="30" height="4">
                <line x1="0" y1="2" x2="30" y2="2" stroke="#f59e0b" strokeWidth="2"/>
              </svg>
              <span>Moderate Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="30" height="4">
                <line x1="0" y1="2" x2="30" y2="2" stroke="#ef4444" strokeWidth="2"/>
              </svg>
              <span>High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="30" height="4">
                <line x1="0" y1="2" x2="30" y2="2" stroke="#9ca3af" strokeWidth="1" strokeDasharray="4,4" opacity="0.5"/>
              </svg>
              <span>Engagement Gap</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalLifeline;

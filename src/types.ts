// Core Data Types for Customer Journey Intelligence System

export type JourneyStage = 'Acquisition' | 'Onboarding' | 'Support' | 'Renewal';

export type ChannelType = 'voice' | 'email' | 'crm' | 'chat';

export type TagType = 'risk' | 'opportunity' | 'flag' | 'compliance';

// Priority levels for visual encoding
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

// Evidence types for drill-down
export interface EvidenceSpan {
  start: number; // seconds into audio/video
  end: number;
  text: string;
  speaker?: string;
  highlightReason?: string;
}

export interface Artifact {
  type: 'audio' | 'transcript' | 'attachment' | 'screen_recording';
  url: string; // signed URL
  name: string;
  size?: number; // bytes
  mimeType?: string;
}

export interface EventMetrics {
  holdTimeSec?: number;
  transferCount?: number;
  escalated?: boolean;
  resolved?: boolean;
  csat?: number; // 1-5
  nps?: number; // -100 to 100
}

export interface JourneyEvent {
  id: string;
  customer_id: string; // explicit customer link
  ts: string; // ISO-8601
  stage: JourneyStage;
  channel: ChannelType;
  title: string;
  summary: string;
  durationSec: number;
  agent: string;
  customer: string;
  tags: TagType[];
  priority: PriorityLevel; // for visual encoding
  weight: number; // for marker sizing and clustering importance (0-100)
  score: {
    risk: number;
    opportunity: number;
  };
  conversation_id: string;
  span_id: string;
  record: {
    system: string;
    object: string;
    record_id: string;
  };
  sentiment: 'very-positive' | 'positive' | 'neutral' | 'negative' | 'very-negative';
  participants: string[];

  // S1: Extended schema fields
  transcript?: string; // full transcript text
  artifacts?: Artifact[]; // audio, attachments, etc.
  evidence?: EvidenceSpan[]; // highlighted spans
  metrics?: EventMetrics; // detailed KPIs

  // Intelligence and actions
  aiInsights?: AIInsight[];
  recommendedActions?: RecommendedAction[];
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Simplified from old model to align with new spec's focus
export interface Customer {
  id: string;
  name: string;
  stage: string;
  healthScore: number; // 0-100
  mrr: number;
  tenure: number; // months
  riskLevel: RiskLevel;
  lastContactDays: number;
  assignedTo: string;
  interactions: JourneyEvent[]; // Renamed from Interaction to JourneyEvent
}

// AI-generated insights from interaction analysis
export interface AIInsight {
  id: string;
  icon?: string;
  title: string;
  description: string;
}

// Recommended actions based on AI analysis
export interface RecommendedAction {
  id: string;
  title: string;
  rationale?: string;
  expectedImpact?: string;
  requiredArtifacts?: string[];
  ctaLink?: string;
}

// Dashboard metrics - kept for the main dashboard view
export interface DashboardMetrics {
  totalCustomers: number;
  atRiskCount: number;
  totalMRR: number;
  avgHealthScore: number;
  activeOpportunities: number;
}

// S10: Journey narration data
export interface JourneySummary {
  customerId: string;
  window: 'all' | '12m' | '90d' | '30d';
  narration: {
    start: string; // How journey began
    highlights: string[]; // Key positive moments
    issues: string[]; // Problems encountered
    improvements: string[]; // Positive trends
    currentStatus: string; // Where things stand
    nextActions: string[]; // Recommended next steps
  };
  kpis: {
    totalEvents: number;
    stageVolumes: Record<JourneyStage, number>;
    riskDensity: number; // % of events with high risk
    opportunityCaptureRate: number; // % of opportunities acted on
    avgHoldTimeSec: number;
    sentimentTrend: 'improving' | 'stable' | 'declining';
    reopenRate: number;
    avgResolutionTimeSec: number;
  };
  citedEventIds: string[]; // Events referenced in narration
}

// S6: Filter state (for URL sync)
export interface TimelineFilters {
  channels: ChannelType[];
  stages: JourneyStage[];
  tags: TagType[];
  timeWindow: 'all' | '12m' | '90d' | '30d';
  from?: string; // ISO-8601
  to?: string; // ISO-8601
  searchQuery?: string;
}

// S6: Timeline view state (for URL sync)
export interface TimelineViewState {
  zoom: number; // scale factor
  panX: number; // horizontal offset
  selectedEventId?: string;
  filters: TimelineFilters;
}

// S5: Cluster representation
export interface EventCluster {
  id: string;
  events: JourneyEvent[];
  centroid: Date; // center timestamp
  dominantTag: TagType;
  dominantChannel: ChannelType;
  bounds: { start: Date; end: Date };
}

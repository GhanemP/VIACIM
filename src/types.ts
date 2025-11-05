// Core Data Types for Customer Journey Intelligence System

export type JourneyStage = 'Acquisition' | 'Onboarding' | 'Support' | 'Renewal';

export type ChannelType = 'voice' | 'email' | 'crm' | 'chat';

export type TagType = 'risk' | 'opportunity' | 'flag' | 'compliance';

export interface JourneyEvent {
  id: string;
  ts: string; // ISO-8601
  stage: JourneyStage;
  channel: ChannelType;
  title: string;
  summary: string;
  durationSec: number;
  agent: string;
  customer: string;
  tags: TagType[];
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
  // Adding fields from old model that are still useful and likely implied
  sentiment: 'very-positive' | 'positive' | 'neutral' | 'negative' | 'very-negative';
  participants: string[];
  transcript?: string;
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
}

// Dashboard metrics - kept for the main dashboard view
export interface DashboardMetrics {
  totalCustomers: number;
  atRiskCount: number;
  totalMRR: number;
  avgHealthScore: number;
  activeOpportunities: number;
}

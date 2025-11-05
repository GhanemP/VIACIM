// Core Data Types for Customer Journey Intelligence System

export type LifecycleStage = 
  | 'prospect' 
  | 'onboarding' 
  | 'adoption' 
  | 'active' 
  | 'at-risk' 
  | 'expansion' 
  | 'churned';

export type InteractionType = 
  | 'call' 
  | 'email' 
  | 'meeting' 
  | 'support' 
  | 'product-usage' 
  | 'billing';

export type SentimentType = 
  | 'very-positive' 
  | 'positive' 
  | 'neutral' 
  | 'negative' 
  | 'very-negative';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type TagType = 
  | 'risk' 
  | 'opportunity' 
  | 'champion' 
  | 'complaint' 
  | 'upsell' 
  | 'churn-signal' 
  | 'success' 
  | 'competitor-mention'
  | 'feature-request'
  | 'billing-issue';

// AI-generated insights from interaction analysis
export interface AIInsight {
  id: string;
  type: 'risk' | 'opportunity' | 'competitor' | 'sentiment' | 'action-required';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number; // 0-100
  icon?: string;
}

// Recommended actions based on AI analysis
export interface RecommendedAction {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'follow-up' | 'escalation' | 'upsell' | 'support' | 'retention';
  dueDate?: Date;
  estimatedImpact?: string;
}

// Individual customer interaction/touchpoint
export interface Interaction {
  id: string;
  customerId: string;
  timestamp: Date;
  type: InteractionType;
  stage: LifecycleStage;
  title: string;
  summary: string;
  sentiment: SentimentType;
  tags: TagType[];
  duration?: number; // minutes
  participants: string[];
  transcript?: string;
  aiInsights: AIInsight[];
  recommendedActions: RecommendedAction[];
  metadata?: {
    dealValue?: number;
    responseTime?: number;
    resolution?: string;
    competitorMentioned?: string;
    churnRiskScore?: number;
  };
}

// Gap in communication/engagement
export interface EngagementGap {
  startDate: Date;
  endDate: Date;
  durationDays: number;
  riskLevel: RiskLevel;
  recommendation: string;
}

// Customer entity with full journey context
export interface Customer {
  id: string;
  name: string;
  tier: 'basic' | 'professional' | 'enterprise';
  stage: LifecycleStage;
  healthScore: number; // 0-100
  mrr: number;
  tenure: number; // months
  riskLevel: RiskLevel;
  lastContactDays: number;
  assignedTo: string; // CSM name
  interactions: Interaction[];
  engagementGaps: EngagementGap[];
  contractRenewalDate?: Date;
  ltv?: number; // lifetime value
  churnProbability?: number; // 0-100
}

// Dashboard metrics
export interface DashboardMetrics {
  totalCustomers: number;
  atRiskCount: number;
  totalMRR: number;
  avgHealthScore: number;
  activeOpportunities: number;
  churnRate?: number;
  expansionRevenue?: number;
}

// Filter options for dashboard
export interface FilterOptions {
  stage?: LifecycleStage[];
  riskLevel?: RiskLevel[];
  healthScoreRange?: [number, number];
  searchQuery?: string;
  assignedTo?: string[];
}

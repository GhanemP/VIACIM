// Utility functions for customer intelligence calculations

import type { 
  Customer, 
  Interaction, 
  EngagementGap, 
  RiskLevel, 
  SentimentType,
  LifecycleStage 
} from './types';

/**
 * Calculate customer health score (0-100)
 * Based on: engagement frequency, sentiment trends, response times, product usage
 */
export function calculateHealthScore(customer: Customer): number {
  let score = 70; // Base score
  
  const recentInteractions = customer.interactions
    .filter(i => {
      const daysSince = Math.floor((Date.now() - i.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince <= 30; // Last 30 days
    });
  
  // Engagement frequency (±20 points)
  const interactionCount = recentInteractions.length;
  if (interactionCount >= 5) score += 20;
  else if (interactionCount >= 3) score += 10;
  else if (interactionCount === 0) score -= 20;
  else score -= 10;
  
  // Sentiment analysis (±15 points)
  const sentimentScores = recentInteractions.map(i => getSentimentScore(i.sentiment));
  const avgSentiment = sentimentScores.length > 0 
    ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length 
    : 0;
  score += avgSentiment;
  
  // Risk tags impact (-5 per risk)
  const riskCount = recentInteractions.reduce((count, i) => 
    count + i.tags.filter(t => ['risk', 'complaint', 'churn-signal'].includes(t)).length, 0
  );
  score -= riskCount * 5;
  
  // Opportunity tags boost (+3 per opportunity)
  const opportunityCount = recentInteractions.reduce((count, i) => 
    count + i.tags.filter(t => ['opportunity', 'upsell', 'success'].includes(t)).length, 0
  );
  score += opportunityCount * 3;
  
  // Champion presence boost (+5)
  const hasChampion = recentInteractions.some(i => i.tags.includes('champion'));
  if (hasChampion) score += 5;
  
  // Last contact recency (±10 points)
  if (customer.lastContactDays <= 7) score += 10;
  else if (customer.lastContactDays <= 14) score += 5;
  else if (customer.lastContactDays > 30) score -= 10;
  else if (customer.lastContactDays > 60) score -= 20;
  
  // Engagement gaps penalty
  const criticalGaps = customer.engagementGaps.filter(g => g.durationDays > 30);
  score -= criticalGaps.length * 10;
  
  // Stage-specific adjustments
  if (customer.stage === 'at-risk') score -= 15;
  else if (customer.stage === 'expansion') score += 10;
  else if (customer.stage === 'churned') score = 0;
  
  // Clamp between 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Convert sentiment to numerical score
 */
function getSentimentScore(sentiment: SentimentType): number {
  const scores: Record<SentimentType, number> = {
    'very-positive': 15,
    'positive': 8,
    'neutral': 0,
    'negative': -8,
    'very-negative': -15,
  };
  return scores[sentiment];
}

/**
 * Determine risk level based on health score and other factors
 */
export function calculateRiskLevel(customer: Customer): RiskLevel {
  const { healthScore, engagementGaps, interactions } = customer;
  
  // Critical: very low health or recent churn signals
  if (healthScore < 40) return 'critical';
  
  const recentChurnSignals = interactions
    .filter(i => {
      const daysSince = Math.floor((Date.now() - i.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince <= 14 && i.tags.includes('churn-signal');
    });
  
  if (recentChurnSignals.length >= 2) return 'critical';
  
  // High: low health or significant gaps
  if (healthScore < 60) return 'high';
  if (engagementGaps.some(g => g.durationDays > 60)) return 'high';
  
  // Medium: moderate health
  if (healthScore < 80) return 'medium';
  
  // Low: healthy customer
  return 'low';
}

/**
 * Detect engagement gaps (periods of no contact)
 */
export function detectEngagementGaps(interactions: Interaction[]): EngagementGap[] {
  if (interactions.length === 0) return [];
  
  const sortedInteractions = [...interactions].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  const gaps: EngagementGap[] = [];
  const GAP_THRESHOLD_DAYS = 7;
  
  for (let i = 1; i < sortedInteractions.length; i++) {
    const prevInteraction = sortedInteractions[i - 1];
    const currentInteraction = sortedInteractions[i];
    
    const gapDays = Math.floor(
      (currentInteraction.timestamp.getTime() - prevInteraction.timestamp.getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    if (gapDays >= GAP_THRESHOLD_DAYS) {
      const riskLevel = determineGapRiskLevel(gapDays);
      gaps.push({
        startDate: prevInteraction.timestamp,
        endDate: currentInteraction.timestamp,
        durationDays: gapDays,
        riskLevel,
        recommendation: getGapRecommendation(gapDays, riskLevel),
      });
    }
  }
  
  // Check for gap from last interaction to now
  const lastInteraction = sortedInteractions[sortedInteractions.length - 1];
  const daysSinceLastContact = Math.floor(
    (Date.now() - lastInteraction.timestamp.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastContact >= GAP_THRESHOLD_DAYS) {
    const riskLevel = determineGapRiskLevel(daysSinceLastContact);
    gaps.push({
      startDate: lastInteraction.timestamp,
      endDate: new Date(),
      durationDays: daysSinceLastContact,
      riskLevel,
      recommendation: getGapRecommendation(daysSinceLastContact, riskLevel),
    });
  }
  
  return gaps;
}

/**
 * Determine risk level based on gap duration
 */
function determineGapRiskLevel(gapDays: number): RiskLevel {
  if (gapDays >= 90) return 'critical';
  if (gapDays >= 60) return 'high';
  if (gapDays >= 30) return 'medium';
  return 'low';
}

/**
 * Generate recommendation for engagement gap
 */
function getGapRecommendation(gapDays: number, riskLevel: RiskLevel): string {
  if (riskLevel === 'critical') {
    return `URGENT: ${gapDays} days of silence. Schedule executive escalation call immediately.`;
  } else if (riskLevel === 'high') {
    return `High priority: ${gapDays} days of silence. Schedule check-in call within 24 hours.`;
  } else if (riskLevel === 'medium') {
    return `${gapDays} days of silence. Schedule routine follow-up this week.`;
  }
  return `${gapDays} days of silence. Consider reaching out soon.`;
}

/**
 * Calculate churn probability (0-100)
 */
export function calculateChurnProbability(customer: Customer): number {
  let churnScore = 0;
  
  // Health score is primary indicator
  if (customer.healthScore < 40) churnScore += 40;
  else if (customer.healthScore < 60) churnScore += 25;
  else if (customer.healthScore < 80) churnScore += 10;
  
  // Recent negative sentiment
  const recentNegative = customer.interactions
    .filter(i => {
      const daysSince = Math.floor((Date.now() - i.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince <= 14 && (i.sentiment === 'negative' || i.sentiment === 'very-negative');
    });
  churnScore += recentNegative.length * 15;
  
  // Churn signals
  const churnSignals = customer.interactions
    .filter(i => i.tags.includes('churn-signal'));
  churnScore += churnSignals.length * 10;
  
  // Long engagement gaps
  const criticalGaps = customer.engagementGaps.filter(g => g.riskLevel === 'critical');
  churnScore += criticalGaps.length * 20;
  
  // At-risk stage
  if (customer.stage === 'at-risk') churnScore += 20;
  
  return Math.min(100, churnScore);
}

/**
 * Get lifecycle stage color for UI
 */
export function getStageColor(stage: LifecycleStage): string {
  const colors: Record<LifecycleStage, string> = {
    'prospect': '#3b82f6',
    'onboarding': '#8b5cf6',
    'adoption': '#6366f1',
    'active': '#10b981',
    'at-risk': '#f59e0b',
    'expansion': '#14b8a6',
    'churned': '#6b7280',
  };
  return colors[stage];
}

/**
 * Get health score color for UI
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#f59e0b'; // Yellow
  if (score >= 40) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

/**
 * Get risk level badge color
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    'low': '#10b981',
    'medium': '#f59e0b',
    'high': '#f97316',
    'critical': '#ef4444',
  };
  return colors[level];
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(date: Date): string {
  const now = Date.now();
  const daysDiff = Math.floor((now - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Yesterday';
  if (daysDiff < 7) return `${daysDiff} days ago`;
  if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
  if (daysDiff < 365) return `${Math.floor(daysDiff / 30)} months ago`;
  return `${Math.floor(daysDiff / 365)} years ago`;
}

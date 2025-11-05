// Generate realistic demo data for customer journey intelligence

import type {
  Customer,
  Interaction,
  AIInsight,
  RecommendedAction,
  LifecycleStage,
  InteractionType,
  SentimentType,
  TagType,
} from './types';
import { calculateHealthScore, calculateRiskLevel, detectEngagementGaps, calculateChurnProbability } from './utils';

/**
 * Generate demo customers with realistic interaction histories
 */
export function generateDemoCustomers(): Customer[] {
  const customers: Customer[] = [
    createRiversidePlumbing(),
    createGoldenDragon(),
    createSummitRoofing(),
    createPrestigeAuto(),
    createEliteLandscaping(),
  ];
  
  // Calculate derived fields
  return customers.map(customer => {
    const engagementGaps = detectEngagementGaps(customer.interactions);
    const healthScore = calculateHealthScore({ ...customer, engagementGaps });
    const riskLevel = calculateRiskLevel({ ...customer, healthScore, engagementGaps });
    const churnProbability = calculateChurnProbability({ ...customer, healthScore, engagementGaps });
    
    // Calculate last contact days
    const lastInteraction = customer.interactions.length > 0
      ? Math.max(...customer.interactions.map(i => i.timestamp.getTime()))
      : Date.now() - 30 * 24 * 60 * 60 * 1000;
    const lastContactDays = Math.floor((Date.now() - lastInteraction) / (1000 * 60 * 60 * 24));
    
    return {
      ...customer,
      healthScore,
      riskLevel,
      engagementGaps,
      churnProbability,
      lastContactDays,
    };
  });
}

/**
 * Riverside Plumbing - At-Risk Customer (Crisis Scenario)
 */
function createRiversidePlumbing(): Customer {
  const baseDate = new Date('2025-05-08');
  
  return {
    id: 'cust-001',
    name: 'Riverside Plumbing',
    tier: 'professional',
    stage: 'at-risk',
    healthScore: 0,
    mrr: 450,
    tenure: 8,
    riskLevel: 'critical',
    lastContactDays: 0,
    assignedTo: 'Sarah Mitchell',
    contractRenewalDate: new Date('2026-03-15'),
    ltv: 3600,
    interactions: [
      createInteraction({
        id: 'int-001',
        customerId: 'cust-001',
        timestamp: new Date(baseDate.getTime()),
        type: 'call',
        stage: 'prospect',
        title: 'Initial discovery call',
        summary: 'Mike interested in digital marketing. Currently relying on word-of-mouth only.',
        sentiment: 'positive',
        tags: ['opportunity'],
        duration: 22,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)'],
        transcript: `Sarah: Thanks for taking the time Mike. Tell me about your plumbing business.\n\nMike: We've been around 15 years. Good reputation but calls are getting slower. Need more leads.\n\nSarah: How many calls do you get per week currently?\n\nMike: Maybe 3-4 on a good week. Used to be 10.\n\nSarah: VIA can definitely help with that. Our clients typically see 5-8 qualified calls per week.\n\nMike: That would be perfect. What's the investment?\n\nSarah: $450 per month for the Professional plan. Includes listing optimization, call tracking, and review management.\n\nMike: Let me think about it over the weekend.`,
        aiInsights: [
          {
            id: 'ai-001',
            type: 'opportunity',
            priority: 'high',
            title: 'Strong purchase intent detected',
            description: 'Customer has clear pain point and budget awareness',
            confidence: 85,
            icon: '🎯',
          },
        ],
        recommendedActions: [
          {
            id: 'act-001',
            title: 'Send proposal and ROI breakdown',
            priority: 'high',
            category: 'follow-up',
          },
        ],
      }),
      
      createInteraction({
        id: 'int-002',
        customerId: 'cust-001',
        timestamp: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        type: 'email',
        stage: 'prospect',
        title: 'Proposal sent with case studies',
        summary: 'Sent detailed proposal with 3 plumbing client success stories.',
        sentiment: 'neutral',
        tags: [],
        participants: ['Sarah Mitchell (CSM)'],
        aiInsights: [],
        recommendedActions: [],
      }),
      
      createInteraction({
        id: 'int-003',
        customerId: 'cust-001',
        timestamp: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        type: 'call',
        stage: 'prospect',
        title: '🎉 Contract signed!',
        summary: 'Mike signed 12-month contract. Excited to get started.',
        sentiment: 'very-positive',
        tags: ['success', 'champion'],
        duration: 15,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)'],
        transcript: `Mike: Sarah, I'm ready to move forward. Let's do this.\n\nSarah: Excellent decision Mike! Let me walk you through onboarding.\n\nMike: When will I start seeing calls?\n\nSarah: Typically within 2-3 weeks as we optimize your listings and get everything set up.\n\nMike: Perfect. I'm excited about this.`,
        aiInsights: [
          {
            id: 'ai-002',
            type: 'opportunity',
            priority: 'high',
            title: 'Champion identified',
            description: 'Customer is highly engaged and optimistic',
            confidence: 92,
            icon: '🏆',
          },
        ],
        recommendedActions: [],
        metadata: {
          dealValue: 5400,
        },
      }),
      
      // LONG GAP - 177 days of silence
      
      createInteraction({
        id: 'int-004',
        customerId: 'cust-001',
        timestamp: new Date('2025-11-02'),
        type: 'call',
        stage: 'at-risk',
        title: '⚠️ Performance complaint - Crisis call',
        summary: 'Mike extremely frustrated. Says calls dropped from 8/week to 2/week. Threatening cancellation.',
        sentiment: 'very-negative',
        tags: ['risk', 'complaint', 'churn-signal', 'competitor-mention'],
        duration: 18,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)'],
        transcript: `Mike: Sarah, I need to talk about this. I'm paying $450 a month and getting nothing.\n\nSarah: I'm so sorry to hear that Mike. What's going on?\n\nMike: I was getting 8 calls a week for the first few months. Now I'm down to 2. My competitor Joe's Plumbing is getting all the calls.\n\nSarah: That's definitely not acceptable. Let me investigate immediately.\n\nMike: I've been patient but I can't justify this expense anymore. Joe is dominating Google now.\n\nSarah: I understand completely. Give me until end of day today and I'll call you back with a full analysis and action plan.\n\nMike: Okay, but I'm seriously considering canceling if this doesn't improve.`,
        aiInsights: [
          {
            id: 'ai-003',
            type: 'risk',
            priority: 'critical',
            title: 'CRITICAL: Churn risk 87%',
            description: 'Customer satisfaction has declined significantly. Immediate action required.',
            confidence: 87,
            icon: '🚨',
          },
          {
            id: 'ai-004',
            type: 'competitor',
            priority: 'critical',
            title: 'Competitor threat: Joe\'s Plumbing',
            description: 'Direct competitive comparison made. Customer sees competitor as superior.',
            confidence: 95,
            icon: '⚔️',
          },
          {
            id: 'ai-005',
            type: 'sentiment',
            priority: 'high',
            title: 'Emotional state: Angry/Frustrated',
            description: 'Customer is highly dissatisfied and has lost trust',
            confidence: 90,
            icon: '😤',
          },
        ],
        recommendedActions: [
          {
            id: 'act-002',
            title: 'URGENT: Audit listing performance within 2 hours',
            priority: 'urgent',
            category: 'support',
            estimatedImpact: 'Critical for retention',
          },
          {
            id: 'act-003',
            title: 'Schedule executive escalation call today',
            priority: 'urgent',
            category: 'escalation',
          },
          {
            id: 'act-004',
            title: 'Prepare service recovery plan with compensation',
            priority: 'urgent',
            category: 'retention',
          },
          {
            id: 'act-005',
            title: 'Competitive analysis: Joe\'s Plumbing vs Riverside',
            priority: 'high',
            category: 'support',
          },
        ],
        metadata: {
          competitorMentioned: 'Joe\'s Plumbing',
          churnRiskScore: 87,
        },
      }),
      
      createInteraction({
        id: 'int-005',
        customerId: 'cust-001',
        timestamp: new Date('2025-11-04'),
        type: 'call',
        stage: 'at-risk',
        title: 'Resolution call - Root cause identified',
        summary: 'Technical issue found: listing was suspended due to payment glitch. Now fixed. Mike cautiously optimistic.',
        sentiment: 'neutral',
        tags: ['risk'],
        duration: 25,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)', 'David Chen (Technical Lead)'],
        transcript: `Sarah: Mike, thank you for your patience. I have David from our technical team.\n\nDavid: Mike, we found the issue. There was a payment processing glitch that caused your listing to be suspended for 3 weeks.\n\nMike: So it wasn't my business? It was a technical problem?\n\nDavid: Exactly. Your listing is now restored and prioritized. We're also giving you 2 months free as compensation.\n\nMike: Okay, I appreciate that. But I need to see results.\n\nSarah: We completely understand. We'll monitor this daily and check in with you weekly.\n\nMike: Alright. I'll give it one more month.`,
        aiInsights: [
          {
            id: 'ai-006',
            type: 'risk',
            priority: 'high',
            title: 'Still at risk - trust damaged',
            description: 'Issue resolved but customer confidence shaken. Requires consistent follow-up.',
            confidence: 78,
            icon: '⚠️',
          },
        ],
        recommendedActions: [
          {
            id: 'act-006',
            title: 'Weekly check-in calls for next 8 weeks',
            priority: 'high',
            category: 'retention',
          },
          {
            id: 'act-007',
            title: 'Send weekly performance reports',
            priority: 'medium',
            category: 'follow-up',
          },
        ],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * Golden Dragon Restaurant - Healthy Active Customer
 */
function createGoldenDragon(): Customer {
  const baseDate = new Date('2025-07-15');
  
  return {
    id: 'cust-002',
    name: 'Golden Dragon Restaurant',
    tier: 'professional',
    stage: 'active',
    healthScore: 0,
    mrr: 295,
    tenure: 4,
    riskLevel: 'low',
    lastContactDays: 0,
    assignedTo: 'Marcus Johnson',
    contractRenewalDate: new Date('2026-07-15'),
    ltv: 1180,
    interactions: [
      createInteraction({
        id: 'int-101',
        customerId: 'cust-002',
        timestamp: new Date(baseDate.getTime()),
        type: 'call',
        stage: 'prospect',
        title: 'Discovery call - Restaurant owner',
        summary: 'Wei interested in getting more reservations and takeout orders.',
        sentiment: 'positive',
        tags: ['opportunity'],
        duration: 18,
        participants: ['Wei Chen (Owner)', 'Marcus Johnson (CSM)'],
        aiInsights: [],
        recommendedActions: [],
      }),
      
      createInteraction({
        id: 'int-102',
        customerId: 'cust-002',
        timestamp: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        type: 'call',
        stage: 'onboarding',
        title: 'Signed! Contract finalized',
        summary: 'Wei signed Basic plan. Wants to grow online presence.',
        sentiment: 'very-positive',
        tags: ['success'],
        duration: 12,
        participants: ['Wei Chen (Owner)', 'Marcus Johnson (CSM)'],
        aiInsights: [],
        recommendedActions: [],
        metadata: { dealValue: 3540 },
      }),
      
      createInteraction({
        id: 'int-103',
        customerId: 'cust-002',
        timestamp: new Date(baseDate.getTime() + 45 * 24 * 60 * 60 * 1000),
        type: 'support',
        stage: 'active',
        title: 'Support ticket: Negative review',
        summary: 'Wei concerned about 1-star review from angry customer. Asking how to respond.',
        sentiment: 'negative',
        tags: ['complaint'],
        duration: 15,
        participants: ['Wei Chen (Owner)', 'Support Team'],
        aiInsights: [],
        recommendedActions: [],
      }),
      
      createInteraction({
        id: 'int-104',
        customerId: 'cust-002',
        timestamp: new Date(baseDate.getTime() + 47 * 24 * 60 * 60 * 1000),
        type: 'call',
        stage: 'active',
        title: 'Review crisis resolved',
        summary: 'Helped Wei craft professional response. Customer changed review to 4 stars!',
        sentiment: 'very-positive',
        tags: ['success', 'champion'],
        duration: 20,
        participants: ['Wei Chen (Owner)', 'Marcus Johnson (CSM)'],
        transcript: `Wei: Marcus, you won't believe it! The customer changed their review to 4 stars after I responded the way you suggested!\n\nMarcus: That's fantastic Wei! Professional responses really do work.\n\nWei: I'm so grateful. This could have really hurt us. You know, I've been thinking about your reputation management add-on...\n\nMarcus: The $199/month service? It includes review monitoring and response templates.\n\nWei: Can you send me info? I think it's time to invest more in our online reputation.`,
        aiInsights: [
          {
            id: 'ai-101',
            type: 'opportunity',
            priority: 'high',
            title: 'Upsell opportunity: Reputation management',
            description: 'Customer explicitly interested in premium add-on after successful crisis resolution',
            confidence: 88,
            icon: '💡',
          },
          {
            id: 'ai-102',
            type: 'sentiment',
            priority: 'medium',
            title: 'Customer loyalty increased',
            description: 'Successful problem resolution has strengthened relationship',
            confidence: 92,
            icon: '🏆',
          },
        ],
        recommendedActions: [
          {
            id: 'act-101',
            title: 'Send reputation management upgrade proposal',
            priority: 'high',
            category: 'upsell',
            estimatedImpact: '+$199/mo MRR',
          },
        ],
      }),
      
      createInteraction({
        id: 'int-105',
        customerId: 'cust-002',
        timestamp: new Date(baseDate.getTime() + 48 * 24 * 60 * 60 * 1000),
        type: 'email',
        stage: 'expansion',
        title: 'Upgrade proposal sent',
        summary: 'Sent reputation management add-on details with case studies.',
        sentiment: 'positive',
        tags: ['upsell'],
        participants: ['Marcus Johnson (CSM)'],
        aiInsights: [],
        recommendedActions: [],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * Summit Roofing - Onboarding Customer
 */
function createSummitRoofing(): Customer {
  const baseDate = new Date('2025-10-15');
  
  return {
    id: 'cust-003',
    name: 'Summit Roofing',
    tier: 'enterprise',
    stage: 'onboarding',
    healthScore: 0,
    mrr: 695,
    tenure: 1,
    riskLevel: 'medium',
    lastContactDays: 0,
    assignedTo: 'Jennifer Lopez',
    contractRenewalDate: new Date('2026-10-15'),
    ltv: 695,
    interactions: [
      createInteraction({
        id: 'int-201',
        customerId: 'cust-003',
        timestamp: new Date(baseDate.getTime()),
        type: 'meeting',
        stage: 'prospect',
        title: 'Enterprise demo presentation',
        summary: 'Presented to Brad and operations team. Strong interest in multi-location features.',
        sentiment: 'positive',
        tags: ['opportunity'],
        duration: 45,
        participants: ['Brad Williams (CEO)', 'Jennifer Lopez (CSM)'],
        aiInsights: [],
        recommendedActions: [],
      }),
      
      createInteraction({
        id: 'int-202',
        customerId: 'cust-003',
        timestamp: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        type: 'call',
        stage: 'onboarding',
        title: 'Contract signed - Enterprise tier',
        summary: 'Closed! $695/mo for 3 locations. Implementation starting.',
        sentiment: 'very-positive',
        tags: ['success'],
        duration: 25,
        participants: ['Brad Williams (CEO)', 'Jennifer Lopez (CSM)'],
        aiInsights: [],
        recommendedActions: [],
        metadata: { dealValue: 8340 },
      }),
      
      createInteraction({
        id: 'int-203',
        customerId: 'cust-003',
        timestamp: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000),
        type: 'meeting',
        stage: 'onboarding',
        title: 'Kickoff meeting - Implementation plan',
        summary: 'Onboarding session. Covered setup timeline and success metrics.',
        sentiment: 'positive',
        tags: [],
        duration: 60,
        participants: ['Brad Williams (CEO)', 'Jennifer Lopez (CSM)', 'Implementation Team'],
        aiInsights: [],
        recommendedActions: [],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * Prestige Auto Group - Prospect
 */
function createPrestigeAuto(): Customer {
  const baseDate = new Date('2025-10-28');
  
  return {
    id: 'cust-004',
    name: 'Prestige Auto Group',
    tier: 'professional',
    stage: 'prospect',
    healthScore: 0,
    mrr: 0,
    tenure: 0,
    riskLevel: 'low',
    lastContactDays: 0,
    assignedTo: 'Sarah Mitchell',
    interactions: [
      createInteraction({
        id: 'int-301',
        customerId: 'cust-004',
        timestamp: new Date(baseDate.getTime()),
        type: 'call',
        stage: 'prospect',
        title: 'Initial outreach call',
        summary: 'Spoke with dealership manager Tom. Interested but wants to see pricing.',
        sentiment: 'neutral',
        tags: [],
        duration: 12,
        participants: ['Tom Rodriguez (Manager)', 'Sarah Mitchell (CSM)'],
        aiInsights: [],
        recommendedActions: [
          {
            id: 'act-301',
            title: 'Send pricing and competitor comparison',
            priority: 'medium',
            category: 'follow-up',
          },
        ],
      }),
      
      createInteraction({
        id: 'int-302',
        customerId: 'cust-004',
        timestamp: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        type: 'email',
        stage: 'prospect',
        title: 'Pricing proposal sent',
        summary: 'Sent Professional plan details and automotive case studies.',
        sentiment: 'neutral',
        tags: ['opportunity'],
        participants: ['Sarah Mitchell (CSM)'],
        aiInsights: [],
        recommendedActions: [],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * Elite Landscaping - Healthy Expansion Candidate
 */
function createEliteLandscaping(): Customer {
  const baseDate = new Date('2025-03-20');
  
  return {
    id: 'cust-005',
    name: 'Elite Landscaping',
    tier: 'professional',
    stage: 'active',
    healthScore: 0,
    mrr: 595,
    tenure: 8,
    riskLevel: 'low',
    lastContactDays: 0,
    assignedTo: 'Marcus Johnson',
    contractRenewalDate: new Date('2026-03-20'),
    ltv: 4760,
    interactions: [
      createInteraction({
        id: 'int-401',
        customerId: 'cust-005',
        timestamp: new Date(baseDate.getTime()),
        type: 'call',
        stage: 'prospect',
        title: 'Referral call - High intent',
        summary: 'Referred by Golden Dragon. Ready to sign.',
        sentiment: 'very-positive',
        tags: ['opportunity', 'champion'],
        duration: 15,
        participants: ['Lisa Anderson (Owner)', 'Marcus Johnson (CSM)'],
        aiInsights: [],
        recommendedActions: [],
      }),
      
      createInteraction({
        id: 'int-402',
        customerId: 'cust-005',
        timestamp: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000),
        type: 'call',
        stage: 'onboarding',
        title: 'Contract signed same week!',
        summary: 'Lisa signed Professional plan. Excited about spring season.',
        sentiment: 'very-positive',
        tags: ['success'],
        duration: 10,
        participants: ['Lisa Anderson (Owner)', 'Marcus Johnson (CSM)'],
        aiInsights: [],
        recommendedActions: [],
        metadata: { dealValue: 7140 },
      }),
      
      createInteraction({
        id: 'int-403',
        customerId: 'cust-005',
        timestamp: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000),
        type: 'call',
        stage: 'active',
        title: 'Quarterly business review',
        summary: 'Lisa thrilled with results. Calls up 300%. Asking about expanding to second location.',
        sentiment: 'very-positive',
        tags: ['success', 'champion', 'upsell'],
        duration: 30,
        participants: ['Lisa Anderson (Owner)', 'Marcus Johnson (CSM)'],
        transcript: `Lisa: Marcus, I have to tell you - this has been incredible. We're getting 15 calls a week now!\n\nMarcus: That's amazing Lisa! How's the business growth?\n\nLisa: We've hired 3 new people and I'm actually opening a second location in the next county.\n\nMarcus: Congratulations! You know, we can extend your plan to cover that location too.\n\nLisa: How much would that be?\n\nMarcus: Just an additional $395 per month for the second location.\n\nLisa: Let me get the new location set up and we'll definitely talk about that in a few months.`,
        aiInsights: [
          {
            id: 'ai-401',
            type: 'opportunity',
            priority: 'high',
            title: 'Expansion opportunity: Second location',
            description: 'Customer opening new location, strong upsell potential',
            confidence: 90,
            icon: '🚀',
          },
        ],
        recommendedActions: [
          {
            id: 'act-401',
            title: 'Follow up in 2 months about second location',
            priority: 'medium',
            category: 'upsell',
            dueDate: new Date(baseDate.getTime() + 120 * 24 * 60 * 60 * 1000),
            estimatedImpact: '+$395/mo MRR',
          },
        ],
      }),
      
      createInteraction({
        id: 'int-404',
        customerId: 'cust-005',
        timestamp: new Date(baseDate.getTime() + 150 * 24 * 60 * 60 * 1000),
        type: 'email',
        stage: 'active',
        title: 'Check-in: Second location opening',
        summary: 'Checking in about new location launch.',
        sentiment: 'positive',
        tags: [],
        participants: ['Marcus Johnson (CSM)'],
        aiInsights: [],
        recommendedActions: [],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * Helper to create interaction with defaults
 */
function createInteraction(data: Partial<Interaction> & {
  id: string;
  customerId: string;
  timestamp: Date;
  type: InteractionType;
  stage: LifecycleStage;
  title: string;
  summary: string;
  sentiment: SentimentType;
}): Interaction {
  return {
    tags: [],
    duration: 0,
    participants: [],
    aiInsights: [],
    recommendedActions: [],
    ...data,
  } as Interaction;
}

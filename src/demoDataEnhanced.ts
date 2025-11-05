// Enhanced demo data with comprehensive customer journeys for VIA Customer Intelligence
// This file provides rich, realistic data showcasing the full capabilities of the system

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
 * Generate enhanced demo customers with rich interaction histories
 */
export function generateDemoCustomers(): Customer[] {
  const customers: Customer[] = [
    createRiversidePlumbing(),       // Critical risk - service failure
    createGoldenDragon(),            // Healthy with upsell opportunity
    createSummitRoofing(),           // Onboarding - early stage
    createPrestigeAuto(),            // Prospect - sales pipeline
    createEliteLandscaping(),        // Champion - expansion ready
    createMetroCarpetCare(),         // Medium risk - engagement gap
    createUrbanDentalGroup(),        // Healthy active - regular contact
    createCoastalHVAC(),             // High risk - payment issues
    createPrimeLocksmith(),          // Churned - lessons learned
    createApexElectrical(),          // Expansion - multi-location success
    createSilverOakCatering(),       // Adoption - learning phase
    createPeakConstructionCo(),      // Enterprise - complex journey
  ];

  // Calculate derived fields for all customers
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
 * 1. Riverside Plumbing - CRITICAL RISK (Service Failure Crisis)
 * Demonstrates: Crisis management, long gap, churn risk, recovery
 */
function createRiversidePlumbing(): Customer {
  const baseDate = new Date('2025-02-10');

  return {
    id: 'cust-001',
    name: 'Riverside Plumbing',
    tier: 'professional',
    stage: 'at-risk',
    healthScore: 0,
    mrr: 450,
    tenure: 10,
    riskLevel: 'critical',
    lastContactDays: 0,
    assignedTo: 'Sarah Mitchell',
    contractRenewalDate: new Date('2026-03-15'),
    ltv: 4500,
    interactions: [
      // Initial contact - positive start
      createInteraction({
        id: 'int-001-01',
        customerId: 'cust-001',
        timestamp: new Date(baseDate.getTime()),
        type: 'call',
        stage: 'prospect',
        title: '📞 Initial discovery call',
        summary: 'Mike interested in digital marketing. Currently relying on word-of-mouth only. Needs more leads.',
        sentiment: 'positive',
        tags: ['opportunity'],
        duration: 22,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)'],
        aiInsights: [createAIInsight('opportunity', 'high', 'Strong purchase intent detected', 'Customer has clear pain point and budget awareness', 85, '🎯')],
        recommendedActions: [createRecommendedAction('Send proposal and ROI breakdown', 'high', 'follow-up')],
      }),

      createInteraction({
        id: 'int-001-02',
        customerId: 'cust-001',
        timestamp: addDays(baseDate, 2),
        type: 'email',
        stage: 'prospect',
        title: '✉️ Proposal sent with plumbing case studies',
        summary: 'Sent detailed proposal with 3 successful plumbing client stories showing 200% lead increase.',
        sentiment: 'neutral',
        tags: ['opportunity'],
        participants: ['Sarah Mitchell (CSM)'],
      }),

      // Contract signed - big win!
      createInteraction({
        id: 'int-001-03',
        customerId: 'cust-001',
        timestamp: addDays(baseDate, 5),
        type: 'call',
        stage: 'onboarding',
        title: '🎉 CONTRACT SIGNED - Welcome aboard!',
        summary: 'Mike signed 12-month Professional plan ($450/mo). Excited to grow business. High expectations.',
        sentiment: 'very-positive',
        tags: ['success', 'champion'],
        duration: 18,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)'],
        aiInsights: [createAIInsight('opportunity', 'high', 'Champion identified', 'Customer highly engaged and optimistic about results', 92, '🏆')],
        metadata: { dealValue: 5400 },
      }),

      // Onboarding phase
      createInteraction({
        id: 'int-001-04',
        customerId: 'cust-001',
        timestamp: addDays(baseDate, 7),
        type: 'meeting',
        stage: 'onboarding',
        title: '👥 Kickoff meeting - Setup & expectations',
        summary: 'Walked through listing optimization, call tracking setup, and review management features. Mike excited.',
        sentiment: 'positive',
        tags: [],
        duration: 45,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)', 'Tech Team'],
      }),

      // Early success
      createInteraction({
        id: 'int-001-05',
        customerId: 'cust-001',
        timestamp: addDays(baseDate, 21),
        type: 'call',
        stage: 'adoption',
        title: '📈 Early wins! First results showing',
        summary: 'Calls increasing from 3/week to 7/week. Mike thrilled with early performance.',
        sentiment: 'very-positive',
        tags: ['success'],
        duration: 12,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)'],
      }),

      // Product usage milestone
      createInteraction({
        id: 'int-001-06',
        customerId: 'cust-001',
        timestamp: addDays(baseDate, 30),
        type: 'product-usage',
        stage: 'active',
        title: '📱 30-day milestone - Strong engagement',
        summary: 'Mike logging in 4x/week, tracking calls actively. Using review management features.',
        sentiment: 'positive',
        tags: ['success'],
        aiInsights: [createAIInsight('sentiment', 'medium', 'High product engagement', 'Customer actively using platform features', 88, '📊')],
      }),

      createInteraction({
        id: 'int-001-07',
        customerId: 'cust-001',
        timestamp: addDays(baseDate, 45),
        type: 'call',
        stage: 'active',
        title: '✅ 45-day check-in - Peak performance',
        summary: 'Now getting 8-9 calls per week consistently. Mike ecstatic. Hired a new plumber.',
        sentiment: 'very-positive',
        tags: ['success', 'champion'],
        duration: 15,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)'],
      }),

      // === CRITICAL GAP STARTS HERE (120 days of silence) ===

      // Service degradation - CRISIS
      createInteraction({
        id: 'int-001-08',
        customerId: 'cust-001',
        timestamp: addDays(baseDate, 165),
        type: 'call',
        stage: 'at-risk',
        title: '🚨 CRISIS CALL - Performance complaint',
        summary: 'Mike extremely frustrated. Calls dropped from 8/week to 2/week over last month. Threatening cancellation.',
        sentiment: 'very-negative',
        tags: ['risk', 'complaint', 'churn-signal', 'competitor-mention'],
        duration: 18,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)'],
        transcript: `Mike: Sarah, I need to talk about this. I'm paying $450 a month and getting nothing now.\n\nSarah: I'm so sorry Mike. What's happening?\n\nMike: I was getting 8 calls a week for months. Now I'm down to 2. My competitor Joe's Plumbing is dominating Google.\n\nSarah: That's definitely not acceptable. Let me investigate immediately.\n\nMike: I've been patient but I can't justify this expense. Joe is getting all the emergency calls now.\n\nSarah: I understand completely. Give me until end of day and I'll call you back with a full analysis.\n\nMike: Okay, but I'm seriously considering canceling if this doesn't improve fast.`,
        aiInsights: [
          createAIInsight('risk', 'critical', 'CRITICAL: Churn risk 87%', 'Customer satisfaction declined significantly. Immediate action required.', 87, '🚨'),
          createAIInsight('competitor', 'critical', 'Competitor threat: Joe\'s Plumbing', 'Direct competitive comparison. Customer sees competitor as superior.', 95, '⚔️'),
          createAIInsight('sentiment', 'high', 'Emotional state: Angry/Frustrated', 'Customer has lost trust and is highly dissatisfied', 90, '😤'),
        ],
        recommendedActions: [
          createRecommendedAction('URGENT: Audit listing performance within 2 hours', 'urgent', 'support', 'Critical for retention'),
          createRecommendedAction('Schedule executive escalation call today', 'urgent', 'escalation'),
          createRecommendedAction('Prepare service recovery plan with compensation', 'urgent', 'retention'),
        ],
        metadata: { competitorMentioned: 'Joe\'s Plumbing', churnRiskScore: 87 },
      }),

      // Resolution attempt
      createInteraction({
        id: 'int-001-09',
        customerId: 'cust-001',
        timestamp: addDays(baseDate, 167),
        type: 'call',
        stage: 'at-risk',
        title: '🔧 Root cause found - Technical issue',
        summary: 'Listing suspended due to payment processing glitch. Issue fixed. Offered 2 months free as compensation.',
        sentiment: 'neutral',
        tags: ['risk'],
        duration: 25,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)', 'David Chen (Tech Lead)'],
        aiInsights: [createAIInsight('risk', 'high', 'Still at risk - trust damaged', 'Issue resolved but customer confidence shaken. Needs consistent follow-up.', 78, '⚠️')],
        recommendedActions: [createRecommendedAction('Weekly check-in calls for next 8 weeks', 'high', 'retention')],
      }),

      // Recovery phase
      createInteraction({
        id: 'int-001-10',
        customerId: 'cust-001',
        timestamp: addDays(baseDate, 174),
        type: 'call',
        stage: 'at-risk',
        title: '📈 Performance recovering',
        summary: 'Calls back up to 5/week. Mike cautiously optimistic but still watching closely.',
        sentiment: 'positive',
        tags: [],
        duration: 10,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)'],
      }),

      createInteraction({
        id: 'int-001-11',
        customerId: 'cust-001',
        timestamp: addDays(baseDate, 181),
        type: 'call',
        stage: 'active',
        title: '✅ Weekly check-in - Confidence building',
        summary: 'Now at 7 calls/week. Mike appreciates the proactive communication. Relationship improving.',
        sentiment: 'positive',
        tags: [],
        duration: 12,
        participants: ['Mike Thompson (Owner)', 'Sarah Mitchell (CSM)'],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * 2. Golden Dragon Restaurant - HEALTHY with UPSELL OPPORTUNITY
 * Demonstrates: Crisis resolution, upsell identification, champion cultivation
 */
function createGoldenDragon(): Customer {
  const baseDate = new Date('2025-06-01');

  return {
    id: 'cust-002',
    name: 'Golden Dragon Restaurant',
    tier: 'professional',
    stage: 'expansion',
    healthScore: 0,
    mrr: 295,
    tenure: 5,
    riskLevel: 'low',
    lastContactDays: 0,
    assignedTo: 'Marcus Johnson',
    contractRenewalDate: new Date('2026-06-01'),
    ltv: 1475,
    interactions: [
      createInteraction({
        id: 'int-002-01',
        customerId: 'cust-002',
        timestamp: baseDate,
        type: 'call',
        stage: 'prospect',
        title: '🍜 Discovery call - Restaurant marketing',
        summary: 'Wei wants more reservations and takeout orders. Currently only 20% online orders.',
        sentiment: 'positive',
        tags: ['opportunity'],
        duration: 18,
        participants: ['Wei Chen (Owner)', 'Marcus Johnson (CSM)'],
      }),

      createInteraction({
        id: 'int-002-02',
        customerId: 'cust-002',
        timestamp: addDays(baseDate, 3),
        type: 'call',
        stage: 'onboarding',
        title: '✅ Contract signed - Basic plan',
        summary: 'Wei signed Basic plan ($295/mo). Wants to grow online presence and compete with chains.',
        sentiment: 'very-positive',
        tags: ['success'],
        duration: 12,
        participants: ['Wei Chen (Owner)', 'Marcus Johnson (CSM)'],
        metadata: { dealValue: 3540 },
      }),

      createInteraction({
        id: 'int-002-03',
        customerId: 'cust-002',
        timestamp: addDays(baseDate, 30),
        type: 'product-usage',
        stage: 'adoption',
        title: '📊 30-day engagement milestone',
        summary: 'Wei actively managing reviews and checking metrics daily. High engagement.',
        sentiment: 'positive',
        tags: [],
      }),

      createInteraction({
        id: 'int-002-04',
        customerId: 'cust-002',
        timestamp: addDays(baseDate, 45),
        type: 'support',
        stage: 'active',
        title: '😟 Support ticket - Negative review crisis',
        summary: 'Angry customer left 1-star review claiming food poisoning. Wei panicking.',
        sentiment: 'negative',
        tags: ['complaint'],
        duration: 15,
        participants: ['Wei Chen (Owner)', 'Support Team'],
        aiInsights: [createAIInsight('risk', 'medium', 'Review crisis - Opportunity to build loyalty', 'How we handle this will define relationship', 75, '⚠️')],
      }),

      createInteraction({
        id: 'int-002-05',
        customerId: 'cust-002',
        timestamp: addDays(baseDate, 47),
        type: 'call',
        stage: 'active',
        title: '🏆 Crisis resolved - Review improved!',
        summary: 'Customer changed review to 4 stars after professional response. Wei extremely grateful.',
        sentiment: 'very-positive',
        tags: ['success', 'champion'],
        duration: 20,
        participants: ['Wei Chen (Owner)', 'Marcus Johnson (CSM)'],
        transcript: `Wei: Marcus! The customer changed their review to 4 stars after I used your response template!\n\nMarcus: That's fantastic Wei! Professional responses really work.\n\nWei: This could have destroyed us. You saved my reputation. I'm thinking about that premium reputation management add-on you mentioned...\n\nMarcus: The $199/month service? Includes 24/7 monitoring and AI-powered response suggestions.\n\nWei: Can you send me the details? After this scare, I think it's worth it.`,
        aiInsights: [
          createAIInsight('opportunity', 'high', 'Upsell opportunity: Reputation Management', 'Customer explicitly interested in premium add-on after crisis resolution', 88, '💡'),
          createAIInsight('sentiment', 'medium', 'Customer loyalty significantly increased', 'Successful problem resolution strengthened relationship', 92, '🏆'),
        ],
        recommendedActions: [createRecommendedAction('Send reputation management upgrade proposal', 'high', 'upsell', '+$199/mo MRR')],
      }),

      createInteraction({
        id: 'int-002-06',
        customerId: 'cust-002',
        timestamp: addDays(baseDate, 48),
        type: 'email',
        stage: 'expansion',
        title: '📄 Upgrade proposal sent',
        summary: 'Sent reputation management add-on proposal with restaurant case studies.',
        sentiment: 'positive',
        tags: ['upsell'],
        participants: ['Marcus Johnson (CSM)'],
      }),

      createInteraction({
        id: 'int-002-07',
        customerId: 'cust-002',
        timestamp: addDays(baseDate, 52),
        type: 'call',
        stage: 'expansion',
        title: '🎉 UPSELL CLOSED - Premium tier!',
        summary: 'Wei upgraded to Premium with reputation management. Now paying $494/mo total.',
        sentiment: 'very-positive',
        tags: ['success', 'upsell'],
        duration: 15,
        participants: ['Wei Chen (Owner)', 'Marcus Johnson (CSM)'],
        metadata: { dealValue: 5928 },
        aiInsights: [createAIInsight('opportunity', 'high', 'Expansion revenue secured', 'Customer upgraded after value demonstration', 95, '💰')],
      }),

      createInteraction({
        id: 'int-002-08',
        customerId: 'cust-002',
        timestamp: addDays(baseDate, 90),
        type: 'call',
        stage: 'active',
        title: '📊 Quarterly business review',
        summary: 'Online orders up 40%. Wei considering opening second location. Strong champion.',
        sentiment: 'very-positive',
        tags: ['success', 'champion'],
        duration: 30,
        participants: ['Wei Chen (Owner)', 'Marcus Johnson (CSM)'],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * 3. Summit Roofing - ONBOARDING (Enterprise, Early Stage)
 * Demonstrates: Complex enterprise sale, multi-location setup
 */
function createSummitRoofing(): Customer {
  const baseDate = new Date('2025-09-15');

  return {
    id: 'cust-003',
    name: 'Summit Roofing',
    tier: 'enterprise',
    stage: 'onboarding',
    healthScore: 0,
    mrr: 695,
    tenure: 2,
    riskLevel: 'medium',
    lastContactDays: 0,
    assignedTo: 'Jennifer Lopez',
    contractRenewalDate: new Date('2026-09-15'),
    ltv: 1390,
    interactions: [
      createInteraction({
        id: 'int-003-01',
        customerId: 'cust-003',
        timestamp: baseDate,
        type: 'meeting',
        stage: 'prospect',
        title: '🎯 Enterprise demo - Multi-location pitch',
        summary: 'Presented to Brad and operations team (3 locations). Strong interest in centralized dashboard.',
        sentiment: 'positive',
        tags: ['opportunity'],
        duration: 45,
        participants: ['Brad Williams (CEO)', 'Jennifer Lopez (CSM)'],
      }),

      createInteraction({
        id: 'int-003-02',
        customerId: 'cust-003',
        timestamp: addDays(baseDate, 7),
        type: 'call',
        stage: 'onboarding',
        title: '🎉 Enterprise contract closed!',
        summary: '$695/mo for 3 locations. 12-month commitment. Implementation starting next week.',
        sentiment: 'very-positive',
        tags: ['success'],
        duration: 25,
        participants: ['Brad Williams (CEO)', 'Jennifer Lopez (CSM)'],
        metadata: { dealValue: 8340 },
      }),

      createInteraction({
        id: 'int-003-03',
        customerId: 'cust-003',
        timestamp: addDays(baseDate, 10),
        type: 'meeting',
        stage: 'onboarding',
        title: '🚀 Kickoff meeting - Implementation roadmap',
        summary: 'Covered setup timeline (6 weeks), success metrics, training schedule for 3 location managers.',
        sentiment: 'positive',
        tags: [],
        duration: 60,
        participants: ['Brad Williams (CEO)', 'Jennifer Lopez (CSM)', 'Implementation Team'],
      }),

      createInteraction({
        id: 'int-003-04',
        customerId: 'cust-003',
        timestamp: addDays(baseDate, 20),
        type: 'call',
        stage: 'onboarding',
        title: '⚙️ Setup checkpoint - Location 1 complete',
        summary: 'First location configured. Waiting on location managers for 2 & 3 to complete training.',
        sentiment: 'neutral',
        tags: [],
        duration: 20,
        participants: ['Brad Williams (CEO)', 'Jennifer Lopez (CSM)'],
        aiInsights: [createAIInsight('risk', 'medium', 'Onboarding velocity slow', 'Location managers not engaging. May need executive push.', 65, '⏱️')],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * 4. Prestige Auto Group - PROSPECT (Active Pipeline)
 * Demonstrates: Sales nurturing, slow-moving deal
 */
function createPrestigeAuto(): Customer {
  const baseDate = new Date('2025-10-10');

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
        id: 'int-004-01',
        customerId: 'cust-004',
        timestamp: baseDate,
        type: 'call',
        stage: 'prospect',
        title: '☎️ Outbound prospecting call',
        summary: 'Spoke with Tom (General Manager). Interested but wants to see ROI data first.',
        sentiment: 'neutral',
        tags: [],
        duration: 12,
        participants: ['Tom Rodriguez (GM)', 'Sarah Mitchell (CSM)'],
        recommendedActions: [createRecommendedAction('Send automotive ROI case studies', 'medium', 'follow-up')],
      }),

      createInteraction({
        id: 'int-004-02',
        customerId: 'cust-004',
        timestamp: addDays(baseDate, 2),
        type: 'email',
        stage: 'prospect',
        title: '📧 ROI documentation sent',
        summary: 'Sent Professional plan pricing and 3 automotive dealership success stories.',
        sentiment: 'neutral',
        tags: ['opportunity'],
        participants: ['Sarah Mitchell (CSM)'],
      }),

      createInteraction({
        id: 'int-004-03',
        customerId: 'cust-004',
        timestamp: addDays(baseDate, 10),
        type: 'call',
        stage: 'prospect',
        title: '📞 Follow-up - Budget discussion',
        summary: 'Tom reviewing with ownership. Budget approved but moving slowly. Q1 2026 start likely.',
        sentiment: 'positive',
        tags: ['opportunity'],
        duration: 15,
        participants: ['Tom Rodriguez (GM)', 'Sarah Mitchell (CSM)'],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * 5. Elite Landscaping - CHAMPION (Expansion Ready)
 * Demonstrates: Perfect customer, referral source, growth opportunity
 */
function createEliteLandscaping(): Customer {
  const baseDate = new Date('2025-03-01');

  return {
    id: 'cust-005',
    name: 'Elite Landscaping',
    tier: 'professional',
    stage: 'active',
    healthScore: 0,
    mrr: 595,
    tenure: 9,
    riskLevel: 'low',
    lastContactDays: 0,
    assignedTo: 'Marcus Johnson',
    contractRenewalDate: new Date('2026-03-01'),
    ltv: 5355,
    interactions: [
      createInteraction({
        id: 'int-005-01',
        customerId: 'cust-005',
        timestamp: baseDate,
        type: 'call',
        stage: 'prospect',
        title: '🌟 Referral call - High intent',
        summary: 'Referred by Golden Dragon. Already sold on value. Ready to sign.',
        sentiment: 'very-positive',
        tags: ['opportunity', 'champion'],
        duration: 15,
        participants: ['Lisa Anderson (Owner)', 'Marcus Johnson (CSM)'],
      }),

      createInteraction({
        id: 'int-005-02',
        customerId: 'cust-005',
        timestamp: addDays(baseDate, 1),
        type: 'call',
        stage: 'onboarding',
        title: '⚡ Fast close - Same week!',
        summary: 'Lisa signed Professional plan. Excited about spring season growth.',
        sentiment: 'very-positive',
        tags: ['success'],
        duration: 10,
        participants: ['Lisa Anderson (Owner)', 'Marcus Johnson (CSM)'],
        metadata: { dealValue: 7140 },
      }),

      createInteraction({
        id: 'int-005-03',
        customerId: 'cust-005',
        timestamp: addDays(baseDate, 60),
        type: 'call',
        stage: 'active',
        title: '📈 60-day review - Incredible results',
        summary: 'Calls up 300%! Lisa hired 3 new employees. Business booming.',
        sentiment: 'very-positive',
        tags: ['success', 'champion'],
        duration: 30,
        participants: ['Lisa Anderson (Owner)', 'Marcus Johnson (CSM)'],
        transcript: `Lisa: Marcus, I have to tell you - this has been life-changing. We're getting 15 calls a week now!\n\nMarcus: That's amazing Lisa! How's business growth?\n\nLisa: We've hired 3 new people and I'm opening a second location in the next county.\n\nMarcus: Congratulations! We can extend your plan to cover that location too.\n\nLisa: How much?\n\nMarcus: Just $395 more per month for the second location.\n\nLisa: Let me get it set up and we'll definitely talk in a few months.`,
        aiInsights: [createAIInsight('opportunity', 'high', 'Expansion: Second location', 'Customer opening new location. Strong upsell potential.', 90, '🚀')],
        recommendedActions: [createRecommendedAction('Follow up in 2 months about second location', 'medium', 'upsell', '+$395/mo MRR')],
      }),

      createInteraction({
        id: 'int-005-04',
        customerId: 'cust-005',
        timestamp: addDays(baseDate, 120),
        type: 'email',
        stage: 'active',
        title: '✉️ Check-in on expansion plans',
        summary: 'Following up on second location opening timeline.',
        sentiment: 'positive',
        tags: [],
        participants: ['Marcus Johnson (CSM)'],
      }),

      createInteraction({
        id: 'int-005-05',
        customerId: 'cust-005',
        timestamp: addDays(baseDate, 180),
        type: 'call',
        stage: 'expansion',
        title: '🎯 Second location confirmed',
        summary: 'New location opens next month. Ready to add to VIA platform.',
        sentiment: 'very-positive',
        tags: ['opportunity', 'upsell'],
        duration: 18,
        participants: ['Lisa Anderson (Owner)', 'Marcus Johnson (CSM)'],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * 6. Metro Carpet Care - MEDIUM RISK (Engagement Gap)
 * Demonstrates: Silent customer, need for proactive outreach
 */
function createMetroCarpetCare(): Customer {
  const baseDate = new Date('2025-05-01');

  return {
    id: 'cust-006',
    name: 'Metro Carpet Care',
    tier: 'professional',
    stage: 'active',
    healthScore: 0,
    mrr: 395,
    tenure: 7,
    riskLevel: 'medium',
    lastContactDays: 0,
    assignedTo: 'Sarah Mitchell',
    contractRenewalDate: new Date('2026-05-01'),
    ltv: 2765,
    interactions: [
      createInteraction({
        id: 'int-006-01',
        customerId: 'cust-006',
        timestamp: baseDate,
        type: 'call',
        stage: 'prospect',
        title: '📞 Initial call - Carpet cleaning business',
        summary: 'Steve wants more commercial contracts. Currently mostly residential.',
        sentiment: 'positive',
        tags: ['opportunity'],
        duration: 20,
        participants: ['Steve Palmer (Owner)', 'Sarah Mitchell (CSM)'],
      }),

      createInteraction({
        id: 'int-006-02',
        customerId: 'cust-006',
        timestamp: addDays(baseDate, 5),
        type: 'call',
        stage: 'onboarding',
        title: '✅ Signed - Professional plan',
        summary: 'Steve signed $395/mo. Wants to compete with major chains.',
        sentiment: 'positive',
        tags: ['success'],
        duration: 14,
        participants: ['Steve Palmer (Owner)', 'Sarah Mitchell (CSM)'],
        metadata: { dealValue: 4740 },
      }),

      createInteraction({
        id: 'int-006-03',
        customerId: 'cust-006',
        timestamp: addDays(baseDate, 40),
        type: 'call',
        stage: 'active',
        title: '📊 First month review - Solid start',
        summary: 'Lead volume up 40%. Steve satisfied with early results.',
        sentiment: 'positive',
        tags: [],
        duration: 18,
        participants: ['Steve Palmer (Owner)', 'Sarah Mitchell (CSM)'],
      }),

      // === GAP: 60 days of silence ===

      createInteraction({
        id: 'int-006-04',
        customerId: 'cust-006',
        timestamp: addDays(baseDate, 100),
        type: 'product-usage',
        stage: 'active',
        title: '⚠️ Product usage declining',
        summary: 'Steve only logging in 1x/month. Low engagement detected.',
        sentiment: 'neutral',
        tags: ['risk'],
        aiInsights: [createAIInsight('risk', 'medium', 'Engagement dropping', 'Customer not actively using platform. Needs check-in.', 68, '📉')],
        recommendedActions: [createRecommendedAction('Schedule proactive health check call', 'high', 'retention')],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * 7. Urban Dental Group - HEALTHY (Regular Contact)
 * Demonstrates: Model customer with consistent engagement
 */
function createUrbanDentalGroup(): Customer {
  const baseDate = new Date('2025-04-01');

  return {
    id: 'cust-007',
    name: 'Urban Dental Group',
    tier: 'professional',
    stage: 'active',
    healthScore: 0,
    mrr: 545,
    tenure: 8,
    riskLevel: 'low',
    lastContactDays: 0,
    assignedTo: 'Jennifer Lopez',
    contractRenewalDate: new Date('2026-04-01'),
    ltv: 4360,
    interactions: [
      createInteraction({
        id: 'int-007-01',
        customerId: 'cust-007',
        timestamp: baseDate,
        type: 'call',
        stage: 'prospect',
        title: '🦷 Discovery - Dental practice growth',
        summary: 'Dr. Patel wants to fill appointment gaps and attract new patients.',
        sentiment: 'positive',
        tags: ['opportunity'],
        duration: 25,
        participants: ['Dr. Priya Patel (Practice Owner)', 'Jennifer Lopez (CSM)'],
      }),

      createInteraction({
        id: 'int-007-02',
        customerId: 'cust-007',
        timestamp: addDays(baseDate, 4),
        type: 'call',
        stage: 'onboarding',
        title: '✅ Contract signed',
        summary: 'Dr. Patel signed Professional plan ($545/mo). Focus on new patient acquisition.',
        sentiment: 'very-positive',
        tags: ['success'],
        duration: 16,
        participants: ['Dr. Priya Patel', 'Jennifer Lopez (CSM)'],
        metadata: { dealValue: 6540 },
      }),

      createInteraction({
        id: 'int-007-03',
        customerId: 'cust-007',
        timestamp: addDays(baseDate, 30),
        type: 'call',
        stage: 'active',
        title: '📈 30-day review - Strong performance',
        summary: 'New patient calls up 60%. Dr. Patel very happy.',
        sentiment: 'very-positive',
        tags: ['success'],
        duration: 20,
        participants: ['Dr. Priya Patel', 'Jennifer Lopez (CSM)'],
      }),

      createInteraction({
        id: 'int-007-04',
        customerId: 'cust-007',
        timestamp: addDays(baseDate, 60),
        type: 'call',
        stage: 'active',
        title: '✅ 60-day check-in',
        summary: 'Consistent results. Schedule filling up nicely. Happy customer.',
        sentiment: 'positive',
        tags: [],
        duration: 15,
        participants: ['Dr. Priya Patel', 'Jennifer Lopez (CSM)'],
      }),

      createInteraction({
        id: 'int-007-05',
        customerId: 'cust-007',
        timestamp: addDays(baseDate, 90),
        type: 'call',
        stage: 'active',
        title: '📊 Quarterly business review',
        summary: 'Practice growth 25% quarter-over-quarter. Dr. Patel is a strong champion.',
        sentiment: 'very-positive',
        tags: ['success', 'champion'],
        duration: 30,
        participants: ['Dr. Priya Patel', 'Jennifer Lopez (CSM)'],
      }),

      createInteraction({
        id: 'int-007-06',
        customerId: 'cust-007',
        timestamp: addDays(baseDate, 120),
        type: 'email',
        stage: 'active',
        title: '💬 Monthly touch-base',
        summary: 'Regular check-in. Everything running smoothly.',
        sentiment: 'positive',
        tags: [],
        participants: ['Jennifer Lopez (CSM)'],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * 8. Coastal HVAC - HIGH RISK (Payment Issues)
 * Demonstrates: Billing problems, payment delays, financial risk
 */
function createCoastalHVAC(): Customer {
  const baseDate = new Date('2025-07-01');

  return {
    id: 'cust-008',
    name: 'Coastal HVAC Services',
    tier: 'professional',
    stage: 'at-risk',
    healthScore: 0,
    mrr: 495,
    tenure: 5,
    riskLevel: 'high',
    lastContactDays: 0,
    assignedTo: 'Marcus Johnson',
    contractRenewalDate: new Date('2026-01-01'),
    ltv: 2475,
    interactions: [
      createInteraction({
        id: 'int-008-01',
        customerId: 'cust-008',
        timestamp: baseDate,
        type: 'call',
        stage: 'prospect',
        title: '❄️ HVAC contractor - Seasonal business',
        summary: 'Dan wants to smooth out seasonal revenue fluctuations.',
        sentiment: 'positive',
        tags: ['opportunity'],
        duration: 22,
        participants: ['Dan Foster (Owner)', 'Marcus Johnson (CSM)'],
      }),

      createInteraction({
        id: 'int-008-02',
        customerId: 'cust-008',
        timestamp: addDays(baseDate, 3),
        type: 'call',
        stage: 'onboarding',
        title: '✅ Signed - Professional plan',
        summary: 'Dan signed $495/mo. Seasonal business means cash flow can be tight.',
        sentiment: 'positive',
        tags: ['success'],
        duration: 18,
        participants: ['Dan Foster (Owner)', 'Marcus Johnson (CSM)'],
        metadata: { dealValue: 5940 },
      }),

      createInteraction({
        id: 'int-008-03',
        customerId: 'cust-008',
        timestamp: addDays(baseDate, 35),
        type: 'call',
        stage: 'active',
        title: '🌡️ Early results - Summer rush',
        summary: 'Emergency calls up 80%. Dan thrilled with summer performance.',
        sentiment: 'very-positive',
        tags: ['success'],
        duration: 16,
        participants: ['Dan Foster (Owner)', 'Marcus Johnson (CSM)'],
      }),

      createInteraction({
        id: 'int-008-04',
        customerId: 'cust-008',
        timestamp: addDays(baseDate, 90),
        type: 'billing',
        stage: 'at-risk',
        title: '⚠️ Payment failed - Card declined',
        summary: 'Monthly payment declined. Attempted 3 times. Dan not responding to emails.',
        sentiment: 'negative',
        tags: ['risk', 'billing-issue'],
        aiInsights: [createAIInsight('risk', 'high', 'Payment failure + silence', 'Customer may be experiencing cash flow issues', 72, '💳')],
        recommendedActions: [createRecommendedAction('Call customer immediately about payment', 'urgent', 'retention')],
      }),

      createInteraction({
        id: 'int-008-05',
        customerId: 'cust-008',
        timestamp: addDays(baseDate, 93),
        type: 'call',
        stage: 'at-risk',
        title: '💰 Payment discussion - Financial pressure',
        summary: 'Dan hit by slow season earlier than expected. Cash tight. Promised payment Friday.',
        sentiment: 'neutral',
        tags: ['risk'],
        duration: 12,
        participants: ['Dan Foster (Owner)', 'Marcus Johnson (CSM)'],
      }),

      createInteraction({
        id: 'int-008-06',
        customerId: 'cust-008',
        timestamp: addDays(baseDate, 96),
        type: 'billing',
        stage: 'at-risk',
        title: '✅ Payment received - Crisis averted',
        summary: 'Payment processed successfully. Need to monitor closely.',
        sentiment: 'neutral',
        tags: [],
        aiInsights: [createAIInsight('risk', 'medium', 'Financial instability risk', 'May face future payment issues. Consider payment plan.', 64, '⚠️')],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * 9. Prime Locksmith - CHURNED (Post-Mortem Analysis)
 * Demonstrates: Lost customer, lessons learned, competitive loss
 */
function createPrimeLocksmith(): Customer {
  const baseDate = new Date('2025-01-15');

  return {
    id: 'cust-009',
    name: 'Prime Locksmith',
    tier: 'basic',
    stage: 'churned',
    healthScore: 0,
    mrr: 0,
    tenure: 4,
    riskLevel: 'critical',
    lastContactDays: 0,
    assignedTo: 'Sarah Mitchell',
    ltv: 980,
    interactions: [
      createInteraction({
        id: 'int-009-01',
        customerId: 'cust-009',
        timestamp: baseDate,
        type: 'call',
        stage: 'prospect',
        title: '🔑 Locksmith discovery call',
        summary: 'Tony interested in Basic plan. Budget-conscious, price-sensitive.',
        sentiment: 'neutral',
        tags: [],
        duration: 14,
        participants: ['Tony Russo (Owner)', 'Sarah Mitchell (CSM)'],
      }),

      createInteraction({
        id: 'int-009-02',
        customerId: 'cust-009',
        timestamp: addDays(baseDate, 6),
        type: 'call',
        stage: 'onboarding',
        title: '✅ Signed Basic plan',
        summary: 'Tony signed lowest tier ($245/mo). Very price-focused.',
        sentiment: 'neutral',
        tags: [],
        duration: 10,
        participants: ['Tony Russo (Owner)', 'Sarah Mitchell (CSM)'],
        metadata: { dealValue: 2940 },
      }),

      createInteraction({
        id: 'int-009-03',
        customerId: 'cust-009',
        timestamp: addDays(baseDate, 30),
        type: 'call',
        stage: 'active',
        title: '📊 30-day check - Lukewarm results',
        summary: 'Modest increase in calls. Tony expecting more for the price.',
        sentiment: 'neutral',
        tags: [],
        duration: 12,
        participants: ['Tony Russo (Owner)', 'Sarah Mitchell (CSM)'],
      }),

      // === GAP: 45 days ===

      createInteraction({
        id: 'int-009-04',
        customerId: 'cust-009',
        timestamp: addDays(baseDate, 75),
        type: 'email',
        stage: 'at-risk',
        title: '📧 Outreach after silence',
        summary: 'Attempted to reach Tony. No response.',
        sentiment: 'neutral',
        tags: ['risk'],
        participants: ['Sarah Mitchell (CSM)'],
      }),

      createInteraction({
        id: 'int-009-05',
        customerId: 'cust-009',
        timestamp: addDays(baseDate, 90),
        type: 'call',
        stage: 'at-risk',
        title: '⚠️ Cancellation notice received',
        summary: 'Tony canceling. Found cheaper competitor at $195/mo. Price was only decision factor.',
        sentiment: 'negative',
        tags: ['risk', 'churn-signal', 'competitor-mention'],
        duration: 8,
        participants: ['Tony Russo (Owner)', 'Sarah Mitchell (CSM)'],
        transcript: `Sarah: Hi Tony, I got your cancellation request. Can we discuss?\n\nTony: I found someone cheaper - $195/mo vs your $245.\n\nSarah: I understand price matters. Can we talk about the value difference?\n\nTony: Not really interested. Already committed to the other company. Thanks anyway.`,
        aiInsights: [
          createAIInsight('risk', 'critical', 'Price-driven churn', 'Customer focused solely on cost, not value. Unable to demonstrate ROI.', 95, '💸'),
          createAIInsight('competitor', 'high', 'Lost to low-cost competitor', 'Competitor undercut pricing by 20%', 88, '⚔️'),
        ],
        metadata: { competitorMentioned: 'Budget Locksmith Marketing', churnRiskScore: 95 },
      }),

      createInteraction({
        id: 'int-009-06',
        customerId: 'cust-009',
        timestamp: addDays(baseDate, 120),
        type: 'billing',
        stage: 'churned',
        title: '🚪 Account closed',
        summary: 'Subscription canceled. Customer churned.',
        sentiment: 'negative',
        tags: [],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * 10. Apex Electrical - EXPANSION SUCCESS (Multi-Location Champion)
 * Demonstrates: Organic growth, referrals, multi-location expansion
 */
function createApexElectrical(): Customer {
  const baseDate = new Date('2024-12-01');

  return {
    id: 'cust-010',
    name: 'Apex Electrical Solutions',
    tier: 'enterprise',
    stage: 'expansion',
    healthScore: 0,
    mrr: 1195,
    tenure: 12,
    riskLevel: 'low',
    lastContactDays: 0,
    assignedTo: 'Jennifer Lopez',
    contractRenewalDate: new Date('2026-12-01'),
    ltv: 14340,
    interactions: [
      createInteraction({
        id: 'int-010-01',
        customerId: 'cust-010',
        timestamp: baseDate,
        type: 'call',
        stage: 'prospect',
        title: '⚡ Electrical contractor - Single location',
        summary: 'Carlos wants to dominate local market. Ambitious growth plans.',
        sentiment: 'very-positive',
        tags: ['opportunity', 'champion'],
        duration: 28,
        participants: ['Carlos Martinez (CEO)', 'Jennifer Lopez (CSM)'],
      }),

      createInteraction({
        id: 'int-010-02',
        customerId: 'cust-010',
        timestamp: addDays(baseDate, 2),
        type: 'call',
        stage: 'onboarding',
        title: '✅ Fast close - Professional plan',
        summary: 'Carlos signed $595/mo. Wants aggressive growth. High energy customer.',
        sentiment: 'very-positive',
        tags: ['success', 'champion'],
        duration: 20,
        participants: ['Carlos Martinez (CEO)', 'Jennifer Lopez (CSM)'],
        metadata: { dealValue: 7140 },
      }),

      createInteraction({
        id: 'int-010-03',
        customerId: 'cust-010',
        timestamp: addDays(baseDate, 60),
        type: 'call',
        stage: 'active',
        title: '🚀 60-day review - Explosive growth',
        summary: 'Calls up 250%. Carlos hired 4 electricians. Revenue doubled.',
        sentiment: 'very-positive',
        tags: ['success', 'champion'],
        duration: 35,
        participants: ['Carlos Martinez (CEO)', 'Jennifer Lopez (CSM)'],
      }),

      createInteraction({
        id: 'int-010-04',
        customerId: 'cust-010',
        timestamp: addDays(baseDate, 120),
        type: 'call',
        stage: 'expansion',
        title: '🏢 Expansion announcement - 2nd location!',
        summary: 'Carlos opening second location 30 miles away. Wants to add to plan.',
        sentiment: 'very-positive',
        tags: ['opportunity', 'upsell'],
        duration: 22,
        participants: ['Carlos Martinez (CEO)', 'Jennifer Lopez (CSM)'],
      }),

      createInteraction({
        id: 'int-010-05',
        customerId: 'cust-010',
        timestamp: addDays(baseDate, 125),
        type: 'call',
        stage: 'expansion',
        title: '💰 Upsell closed - Location 2 added',
        summary: 'Added second location for +$395/mo. Now paying $990/mo total.',
        sentiment: 'very-positive',
        tags: ['success', 'upsell'],
        duration: 15,
        participants: ['Carlos Martinez (CEO)', 'Jennifer Lopez (CSM)'],
        metadata: { dealValue: 11880 },
      }),

      createInteraction({
        id: 'int-010-06',
        customerId: 'cust-010',
        timestamp: addDays(baseDate, 240),
        type: 'call',
        stage: 'expansion',
        title: '🏆 Location 3 announced - Becoming regional!',
        summary: 'Carlos planning third location. Wants Enterprise tier with centralized dashboard.',
        sentiment: 'very-positive',
        tags: ['opportunity', 'upsell'],
        duration: 40,
        participants: ['Carlos Martinez (CEO)', 'Jennifer Lopez (CSM)'],
        aiInsights: [createAIInsight('opportunity', 'high', 'Enterprise upgrade opportunity', 'Customer growing into Enterprise tier. Perfect timing.', 94, '🎯')],
      }),

      createInteraction({
        id: 'int-010-07',
        customerId: 'cust-010',
        timestamp: addDays(baseDate, 250),
        type: 'call',
        stage: 'expansion',
        title: '🎉 Enterprise tier closed - 3 locations',
        summary: 'Upgraded to Enterprise with 3-location package. Now $1,195/mo. Major win!',
        sentiment: 'very-positive',
        tags: ['success', 'upsell', 'champion'],
        duration: 25,
        participants: ['Carlos Martinez (CEO)', 'Jennifer Lopez (CSM)'],
        metadata: { dealValue: 14340 },
      }),

      createInteraction({
        id: 'int-010-08',
        customerId: 'cust-010',
        timestamp: addDays(baseDate, 280),
        type: 'call',
        stage: 'active',
        title: '🌟 Referral source - Gave us 2 leads',
        summary: 'Carlos referred 2 other electrical contractors. Strong champion.',
        sentiment: 'very-positive',
        tags: ['success', 'champion'],
        duration: 18,
        participants: ['Carlos Martinez (CEO)', 'Jennifer Lopez (CSM)'],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * 11. Silver Oak Catering - ADOPTION PHASE
 * Demonstrates: Learning curve, feature adoption, training needs
 */
function createSilverOakCatering(): Customer {
  const baseDate = new Date('2025-09-01');

  return {
    id: 'cust-011',
    name: 'Silver Oak Catering',
    tier: 'professional',
    stage: 'adoption',
    healthScore: 0,
    mrr: 445,
    tenure: 3,
    riskLevel: 'medium',
    lastContactDays: 0,
    assignedTo: 'Marcus Johnson',
    contractRenewalDate: new Date('2026-09-01'),
    ltv: 1335,
    interactions: [
      createInteraction({
        id: 'int-011-01',
        customerId: 'cust-011',
        timestamp: baseDate,
        type: 'call',
        stage: 'prospect',
        title: '🍽️ Catering company discovery',
        summary: 'Michelle wants more corporate event inquiries. Not tech-savvy.',
        sentiment: 'positive',
        tags: ['opportunity'],
        duration: 24,
        participants: ['Michelle Davis (Owner)', 'Marcus Johnson (CSM)'],
      }),

      createInteraction({
        id: 'int-011-02',
        customerId: 'cust-011',
        timestamp: addDays(baseDate, 8),
        type: 'call',
        stage: 'onboarding',
        title: '✅ Signed - Needs extra training',
        summary: 'Michelle signed $445/mo. Will need extra onboarding support. Not comfortable with tech.',
        sentiment: 'positive',
        tags: [],
        duration: 22,
        participants: ['Michelle Davis (Owner)', 'Marcus Johnson (CSM)'],
        metadata: { dealValue: 5340 },
      }),

      createInteraction({
        id: 'int-011-03',
        customerId: 'cust-011',
        timestamp: addDays(baseDate, 12),
        type: 'support',
        stage: 'onboarding',
        title: '❓ Support ticket - Login issues',
        summary: 'Michelle having trouble accessing dashboard. Forgot password 3 times.',
        sentiment: 'negative',
        tags: [],
        duration: 15,
        participants: ['Michelle Davis (Owner)', 'Support Team'],
      }),

      createInteraction({
        id: 'int-011-04',
        customerId: 'cust-011',
        timestamp: addDays(baseDate, 18),
        type: 'call',
        stage: 'adoption',
        title: '📚 Extra training session',
        summary: 'Walked Michelle through platform step-by-step. She is improving.',
        sentiment: 'neutral',
        tags: [],
        duration: 40,
        participants: ['Michelle Davis (Owner)', 'Marcus Johnson (CSM)'],
      }),

      createInteraction({
        id: 'int-011-05',
        customerId: 'cust-011',
        timestamp: addDays(baseDate, 45),
        type: 'call',
        stage: 'adoption',
        title: '🎯 Starting to see value',
        summary: 'Michelle finally comfortable with platform. Event inquiries up 30%.',
        sentiment: 'positive',
        tags: [],
        duration: 16,
        participants: ['Michelle Davis (Owner)', 'Marcus Johnson (CSM)'],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

/**
 * 12. Peak Construction Co - ENTERPRISE COMPLEX
 * Demonstrates: Complex enterprise sale, multiple stakeholders, long sales cycle
 */
function createPeakConstructionCo(): Customer {
  const baseDate = new Date('2025-07-01');

  return {
    id: 'cust-012',
    name: 'Peak Construction Co',
    tier: 'enterprise',
    stage: 'prospect',
    healthScore: 0,
    mrr: 0,
    tenure: 0,
    riskLevel: 'low',
    lastContactDays: 0,
    assignedTo: 'Jennifer Lopez',
    interactions: [
      createInteraction({
        id: 'int-012-01',
        customerId: 'cust-012',
        timestamp: baseDate,
        type: 'meeting',
        stage: 'prospect',
        title: '🏗️ Enterprise demo - Multi-stakeholder',
        summary: 'Presented to COO, Marketing Director, and 5 Division Managers. Complex decision-making process.',
        sentiment: 'positive',
        tags: ['opportunity'],
        duration: 60,
        participants: ['James Sullivan (COO)', 'Marketing Team', 'Jennifer Lopez (CSM)'],
      }),

      createInteraction({
        id: 'int-012-02',
        customerId: 'cust-012',
        timestamp: addDays(baseDate, 14),
        type: 'email',
        stage: 'prospect',
        title: '📧 Enterprise proposal sent',
        summary: 'Sent comprehensive proposal for 5-location Enterprise package ($1,495/mo).',
        sentiment: 'positive',
        tags: ['opportunity'],
        participants: ['Jennifer Lopez (CSM)'],
      }),

      createInteraction({
        id: 'int-012-03',
        customerId: 'cust-012',
        timestamp: addDays(baseDate, 30),
        type: 'meeting',
        stage: 'prospect',
        title: '💼 Executive stakeholder meeting',
        summary: 'Presenting to C-suite. CFO concerned about ROI. Need to provide more data.',
        sentiment: 'neutral',
        tags: [],
        duration: 45,
        participants: ['James Sullivan (COO)', 'CFO', 'Jennifer Lopez (CSM)'],
        aiInsights: [createAIInsight('risk', 'medium', 'CFO skepticism - Need ROI proof', 'Financial stakeholder needs stronger business case', 70, '📊')],
        recommendedActions: [createRecommendedAction('Prepare detailed ROI analysis with construction industry benchmarks', 'high', 'follow-up')],
      }),

      createInteraction({
        id: 'int-012-04',
        customerId: 'cust-012',
        timestamp: addDays(baseDate, 45),
        type: 'email',
        stage: 'prospect',
        title: '📊 ROI analysis sent',
        summary: 'Sent comprehensive ROI breakdown showing 400% return in year 1 based on construction industry data.',
        sentiment: 'positive',
        tags: ['opportunity'],
        participants: ['Jennifer Lopez (CSM)'],
      }),
    ],
    engagementGaps: [],
    churnProbability: 0,
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Create interaction with defaults
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

/**
 * Create AI insight helper
 */
function createAIInsight(
  type: AIInsight['type'],
  priority: AIInsight['priority'],
  title: string,
  description: string,
  confidence: number,
  icon?: string
): AIInsight {
  return {
    id: `ai-${Math.random().toString(36).substring(7)}`,
    type,
    priority,
    title,
    description,
    confidence,
    icon,
  };
}

/**
 * Create recommended action helper
 */
function createRecommendedAction(
  title: string,
  priority: RecommendedAction['priority'],
  category: RecommendedAction['category'],
  estimatedImpact?: string
): RecommendedAction {
  return {
    id: `act-${Math.random().toString(36).substring(7)}`,
    title,
    priority,
    category,
    estimatedImpact,
  };
}

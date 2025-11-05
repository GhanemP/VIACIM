// Enhanced demo data with comprehensive customer journeys for VIA Customer Intelligence
// This file provides rich, realistic data showcasing the full capabilities of the system

import type {
  Customer,
  JourneyEvent,
  AIInsight,
  RecommendedAction,
  JourneyStage,
  ChannelType,
  PriorityLevel,
} from './types';

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
    const healthScore = customer.interactions.length > 0 ? (customer.interactions.reduce((acc, i) => acc + (100 - i.score.risk), 0) / customer.interactions.length) : 50;
    const riskLevel = healthScore < 40 ? 'critical' : healthScore < 60 ? 'high' : healthScore < 80 ? 'medium' : 'low';

    // Calculate last contact days
    const lastInteraction = customer.interactions.length > 0
      ? Math.max(...customer.interactions.map(i => new Date(i.ts).getTime()))
      : Date.now() - 30 * 24 * 60 * 60 * 1000;
    const lastContactDays = Math.floor((Date.now() - lastInteraction) / (1000 * 60 * 60 * 24));

    return {
      ...customer,
      healthScore: Math.round(healthScore),
      riskLevel,
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
  const customerName = 'Riverside Plumbing';
  const agentName = 'Sarah Mitchell';

  return {
    id: 'cust-001',
    name: customerName,
    stage: 'at-risk',
    healthScore: 0,
    mrr: 450,
    tenure: 10,
    riskLevel: 'critical',
    lastContactDays: 0,
    assignedTo: agentName,
    interactions: [
      // Initial contact - positive start
      createJourneyEvent({
        id: 'int-001-01',
        customer_id: 'cust-001',
        ts: new Date(baseDate.getTime()).toISOString(),
        stage: 'Acquisition',
        channel: 'voice',
        title: '📞 Initial discovery call',
        summary: 'Mike interested in digital marketing. Currently relying on word-of-mouth only. Needs more leads.',
        durationSec: 22 * 60,
        agent: agentName,
        customer: customerName,
        tags: ['opportunity'],
        score: { risk: 10, opportunity: 80 },
        participants: ['Mike Thompson (Owner)', agentName],
        aiInsights: [createAIInsight('🎯', 'Strong purchase intent detected', 'Customer has clear pain point and budget awareness')],
        recommendedActions: [createRecommendedAction('Send proposal and ROI breakdown')],
      }),

      createJourneyEvent({
        id: 'int-001-02',
        customer_id: 'cust-001',
        ts: addDays(baseDate, 2).toISOString(),
        stage: 'Acquisition',
        channel: 'email',
        title: '✉️ Proposal sent with plumbing case studies',
        summary: 'Sent detailed proposal with 3 successful plumbing client stories showing 200% lead increase.',
        agent: agentName,
        customer: customerName,
        tags: ['opportunity'],
        score: { risk: 5, opportunity: 85 },
        participants: [agentName],
      }),

      // Contract signed - big win!
      createJourneyEvent({
        id: 'int-001-03',
        customer_id: 'cust-001',
        ts: addDays(baseDate, 5).toISOString(),
        stage: 'Onboarding',
        channel: 'voice',
        title: '🎉 CONTRACT SIGNED - Welcome aboard!',
        summary: 'Mike signed 12-month Professional plan ($450/mo). Excited to grow business. High expectations.',
        durationSec: 18 * 60,
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 2, opportunity: 95 },
        participants: ['Mike Thompson (Owner)', agentName],
        aiInsights: [createAIInsight('🏆', 'Champion identified', 'Customer highly engaged and optimistic about results')],
      }),

      // Onboarding phase
      createJourneyEvent({
        id: 'int-001-04',
        customer_id: 'cust-001',
        ts: addDays(baseDate, 7).toISOString(),
        stage: 'Onboarding',
        channel: 'crm', // Changed from meeting to crm
        title: '👥 Kickoff meeting - Setup & expectations',
        summary: 'Walked through listing optimization, call tracking setup, and review management features. Mike excited.',
        durationSec: 45 * 60,
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 5, opportunity: 20 },
        participants: ['Mike Thompson (Owner)', agentName, 'Tech Team'],
      }),

      // Early success
      createJourneyEvent({
        id: 'int-001-05',
        customer_id: 'cust-001',
        ts: addDays(baseDate, 21).toISOString(),
        stage: 'Support', // Changed from adoption to Support
        channel: 'voice',
        title: '📈 Early wins! First results showing',
        summary: 'Calls increasing from 3/week to 7/week. Mike thrilled with early performance.',
        durationSec: 12 * 60,
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 5, opportunity: 70 },
        participants: ['Mike Thompson (Owner)', agentName],
      }),

      // Product usage milestone
      createJourneyEvent({
        id: 'int-001-06',
        customer_id: 'cust-001',
        ts: addDays(baseDate, 30).toISOString(),
        stage: 'Support', // Changed from active to Support
        channel: 'chat', // Changed from product-usage to chat
        title: '📱 30-day milestone - Strong engagement',
        summary: 'Mike logging in 4x/week, tracking calls actively. Using review management features.',
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 5, opportunity: 40 },
        aiInsights: [createAIInsight('📊', 'High product engagement', 'Customer actively using platform features')],
      }),

      createJourneyEvent({
        id: 'int-001-07',
        customer_id: 'cust-001',
        ts: addDays(baseDate, 45).toISOString(),
        stage: 'Support',
        channel: 'voice',
        title: '✅ 45-day check-in - Peak performance',
        summary: 'Now getting 8-9 calls per week consistently. Mike ecstatic. Hired a new plumber.',
        durationSec: 15 * 60,
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 2, opportunity: 80 },
        participants: ['Mike Thompson (Owner)', agentName],
      }),

      // === CRITICAL GAP STARTS HERE (120 days of silence) ===

      // Service degradation - CRISIS
      createJourneyEvent({
        id: 'int-001-08',
        customer_id: 'cust-001',
        ts: addDays(baseDate, 165).toISOString(),
        stage: 'Support',
        channel: 'voice',
        title: '🚨 CRISIS CALL - Performance complaint',
        summary: 'Mike extremely frustrated. Calls dropped from 8/week to 2/week over last month. Threatening cancellation.',
        durationSec: 18 * 60,
        agent: agentName,
        customer: customerName,
        tags: ['risk', 'flag'],
        score: { risk: 90, opportunity: 0 },
        participants: ['Mike Thompson (Owner)', agentName],
        transcript: `Mike: Sarah, I need to talk about this. I'm paying $450 a month and getting nothing now.\n\nSarah: I'm so sorry Mike. What's happening?\n\nMike: I was getting 8 calls a week for months. Now I'm down to 2. My competitor Joe's Plumbing is dominating Google.\n\nSarah: That's definitely not acceptable. Let me investigate immediately.\n\nMike: I've been patient but I can't justify this expense. Joe is getting all the emergency calls now.\n\nSarah: I understand completely. Give me until end of day and I'll call you back with a full analysis.\n\nMike: Okay, but I'm seriously considering canceling if this doesn't improve fast.`,
        aiInsights: [
          createAIInsight('🚨', 'CRITICAL: Churn risk 87%', 'Customer satisfaction declined significantly. Immediate action required.'),
          createAIInsight('⚔️', 'Competitor threat: Joe\'s Plumbing', 'Direct competitive comparison. Customer sees competitor as superior.'),
          createAIInsight('😤', 'Emotional state: Angry/Frustrated', 'Customer has lost trust and is highly dissatisfied'),
        ],
        recommendedActions: [
          createRecommendedAction('URGENT: Audit listing performance within 2 hours'),
          createRecommendedAction('Schedule executive escalation call today'),
          createRecommendedAction('Prepare service recovery plan with compensation'),
        ],
      }),

      // Resolution attempt
      createJourneyEvent({
        id: 'int-001-09',
        customer_id: 'cust-001',
        ts: addDays(baseDate, 167).toISOString(),
        stage: 'Support',
        channel: 'voice',
        title: '🔧 Root cause found - Technical issue',
        summary: 'Listing suspended due to payment processing glitch. Issue fixed. Offered 2 months free as compensation.',
        durationSec: 25 * 60,
        agent: agentName,
        customer: customerName,
        tags: ['risk'],
        score: { risk: 60, opportunity: 30 },
        participants: ['Mike Thompson (Owner)', agentName, 'David Chen (Tech Lead)'],
        aiInsights: [createAIInsight('⚠️', 'Still at risk - trust damaged', 'Issue resolved but customer confidence shaken. Needs consistent follow-up.')],
        recommendedActions: [createRecommendedAction('Weekly check-in calls for next 8 weeks')],
      }),

      // Recovery phase
      createJourneyEvent({
        id: 'int-001-10',
        customer_id: 'cust-001',
        ts: addDays(baseDate, 174).toISOString(),
        stage: 'Support',
        channel: 'voice',
        title: '📈 Performance recovering',
        summary: 'Calls back up to 5/week. Mike cautiously optimistic but still watching closely.',
        durationSec: 10 * 60,
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 40, opportunity: 50 },
        participants: ['Mike Thompson (Owner)', agentName],
      }),

      createJourneyEvent({
        id: 'int-001-11',
        customer_id: 'cust-001',
        ts: addDays(baseDate, 181).toISOString(),
        stage: 'Renewal',
        channel: 'voice',
        title: '✅ Weekly check-in - Confidence building',
        summary: 'Now at 7 calls/week. Mike appreciates the proactive communication. Relationship improving.',
        durationSec: 12 * 60,
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 20, opportunity: 60 },
        participants: ['Mike Thompson (Owner)', agentName],
      }),
    ],
  };
}

/**
 * 2. Golden Dragon Restaurant - HEALTHY with UPSELL OPPORTUNITY
 * Demonstrates: Crisis resolution, upsell identification, champion cultivation
 */
function createGoldenDragon(): Customer {
  const baseDate = new Date('2025-06-01');
  const customerName = 'Golden Dragon Restaurant';
  const agentName = 'Marcus Johnson';

  return {
    id: 'cust-002',
    name: customerName,
    stage: 'expansion',
    healthScore: 0,
    mrr: 295,
    tenure: 5,
    riskLevel: 'low',
    lastContactDays: 0,
    assignedTo: agentName,
    interactions: [
      createJourneyEvent({
        id: 'int-002-01',
        customer_id: 'cust-002',
        ts: baseDate.toISOString(),
        stage: 'Acquisition',
        channel: 'voice',
        title: '🍜 Discovery call - Restaurant marketing',
        summary: 'Wei wants more reservations and takeout orders. Currently only 20% online orders.',
        durationSec: 18 * 60,
        agent: agentName,
        customer: customerName,
        tags: ['opportunity'],
        score: { risk: 10, opportunity: 90 },
        participants: ['Wei Chen (Owner)', agentName],
      }),

      createJourneyEvent({
        id: 'int-002-02',
        customer_id: 'cust-002',
        ts: addDays(baseDate, 3).toISOString(),
        stage: 'Onboarding',
        channel: 'voice',
        title: '✅ Contract signed - Basic plan',
        summary: 'Wei signed Basic plan ($295/mo). Wants to grow online presence and compete with chains.',
        durationSec: 12 * 60,
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 5, opportunity: 95 },
        participants: ['Wei Chen (Owner)', agentName],
      }),

      createJourneyEvent({
        id: 'int-002-03',
        customer_id: 'cust-002',
        ts: addDays(baseDate, 30).toISOString(),
        stage: 'Onboarding',
        channel: 'chat',
        title: '📊 30-day engagement milestone',
        summary: 'Wei actively managing reviews and checking metrics daily. High engagement.',
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 10, opportunity: 60 },
      }),

      createJourneyEvent({
        id: 'int-002-04',
        customer_id: 'cust-002',
        ts: addDays(baseDate, 45).toISOString(),
        stage: 'Support',
        channel: 'crm',
        title: '😟 Support ticket - Negative review crisis',
        summary: 'Angry customer left 1-star review claiming food poisoning. Wei panicking.',
        durationSec: 15 * 60,
        agent: 'Support Team',
        customer: customerName,
        tags: ['flag'],
        score: { risk: 70, opportunity: 10 },
        participants: ['Wei Chen (Owner)', 'Support Team'],
        aiInsights: [createAIInsight('⚠️', 'Review crisis - Opportunity to build loyalty', 'How we handle this will define relationship')],
      }),

      createJourneyEvent({
        id: 'int-002-05',
        customer_id: 'cust-002',
        ts: addDays(baseDate, 47).toISOString(),
        stage: 'Support',
        channel: 'voice',
        title: '🏆 Crisis resolved - Review improved!',
        summary: 'Customer changed review to 4 stars after professional response. Wei extremely grateful.',
        durationSec: 20 * 60,
        agent: agentName,
        customer: customerName,
        tags: ['opportunity'],
        score: { risk: 20, opportunity: 90 },
        participants: ['Wei Chen (Owner)', agentName],
        transcript: `Wei: Marcus! The customer changed their review to 4 stars after I used your response template!\n\nMarcus: That's fantastic Wei! Professional responses really work.\n\nWei: This could have destroyed us. You saved my reputation. I'm thinking about that premium reputation management add-on you mentioned...\n\nMarcus: The $199/month service? Includes 24/7 monitoring and AI-powered response suggestions.\n\nWei: Can you send me the details? After this scare, I think it's worth it.`,
        aiInsights: [
          createAIInsight('💡', 'Upsell opportunity: Reputation Management', 'Customer explicitly interested in premium add-on after crisis resolution'),
          createAIInsight('🏆', 'Customer loyalty significantly increased', 'Successful problem resolution strengthened relationship'),
        ],
        recommendedActions: [createRecommendedAction('Send reputation management upgrade proposal')],
      }),

      createJourneyEvent({
        id: 'int-002-06',
        customer_id: 'cust-002',
        ts: addDays(baseDate, 48).toISOString(),
        stage: 'Renewal',
        channel: 'email',
        title: '📄 Upgrade proposal sent',
        summary: 'Sent reputation management add-on proposal with restaurant case studies.',
        agent: agentName,
        customer: customerName,
        tags: ['opportunity'],
        score: { risk: 10, opportunity: 95 },
        participants: [agentName],
      }),

      createJourneyEvent({
        id: 'int-002-07',
        customer_id: 'cust-002',
        ts: addDays(baseDate, 52).toISOString(),
        stage: 'Renewal',
        channel: 'voice',
        title: '🎉 UPSELL CLOSED - Premium tier!',
        summary: 'Wei upgraded to Premium with reputation management. Now paying $494/mo total.',
        durationSec: 15 * 60,
        agent: agentName,
        customer: customerName,
        tags: ['opportunity'],
        score: { risk: 5, opportunity: 100 },
        participants: ['Wei Chen (Owner)', agentName],
        aiInsights: [createAIInsight('💰', 'Expansion revenue secured', 'Customer upgraded after value demonstration')],
      }),

      createJourneyEvent({
        id: 'int-002-08',
        customer_id: 'cust-002',
        ts: addDays(baseDate, 90).toISOString(),
        stage: 'Renewal',
        channel: 'voice',
        title: '📊 Quarterly business review',
        summary: 'Online orders up 40%. Wei considering opening second location. Strong champion.',
        durationSec: 30 * 60,
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 5, opportunity: 80 },
        participants: ['Wei Chen (Owner)', agentName],
      }),
    ],
  };
}

/**
 * 3. Summit Roofing - ONBOARDING (Enterprise, Early Stage)
 */
function createSummitRoofing(): Customer {
  const baseDate = new Date('2025-09-15');
  const customerName = 'Summit Roofing';
  const agentName = 'Jennifer Lopez';
  return {
    id: 'cust-003',
    name: customerName,
    stage: 'onboarding',
    healthScore: 0,
    mrr: 695,
    tenure: 2,
    riskLevel: 'medium',
    lastContactDays: 0,
    assignedTo: agentName,
    interactions: [
      createJourneyEvent({
        id: 'int-003-01',
        customer_id: 'cust-003',
        ts: baseDate.toISOString(),
        stage: 'Acquisition',
        channel: 'crm',
        title: '🎯 Enterprise demo - Multi-location pitch',
        summary: 'Presented to Brad and operations team (3 locations). Strong interest in centralized dashboard.',
        durationSec: 45 * 60,
        agent: agentName,
        customer: customerName,
        tags: ['opportunity'],
        score: { risk: 15, opportunity: 85 },
        participants: ['Brad Williams (CEO)', agentName],
      }),
      createJourneyEvent({
        id: 'int-003-02',
        customer_id: 'cust-003',
        ts: addDays(baseDate, 7).toISOString(),
        stage: 'Onboarding',
        channel: 'voice',
        title: '🎉 Enterprise contract closed!',
        summary: '$695/mo for 3 locations. 12-month commitment. Implementation starting next week.',
        durationSec: 25 * 60,
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 5, opportunity: 95 },
        participants: ['Brad Williams (CEO)', agentName],
      }),
      createJourneyEvent({
        id: 'int-003-03',
        customer_id: 'cust-003',
        ts: addDays(baseDate, 10).toISOString(),
        stage: 'Onboarding',
        channel: 'crm',
        title: '🚀 Kickoff meeting - Implementation roadmap',
        summary: 'Covered setup timeline (6 weeks), success metrics, training schedule for 3 location managers.',
        durationSec: 60 * 60,
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 10, opportunity: 50 },
        participants: ['Brad Williams (CEO)', agentName, 'Implementation Team'],
      }),
      createJourneyEvent({
        id: 'int-003-04',
        customer_id: 'cust-003',
        ts: addDays(baseDate, 20).toISOString(),
        stage: 'Onboarding',
        channel: 'voice',
        title: '⚙️ Setup checkpoint - Location 1 complete',
        summary: 'First location configured. Waiting on location managers for 2 & 3 to complete training.',
        durationSec: 20 * 60,
        agent: agentName,
        customer: customerName,
        tags: ['risk'],
        score: { risk: 40, opportunity: 30 },
        participants: ['Brad Williams (CEO)', agentName],
        aiInsights: [createAIInsight('⏱️', 'Onboarding velocity slow', 'Location managers not engaging. May need executive push.')],
      }),
    ],
  };
}

/**
 * 4. Prestige Auto Group - PROSPECT (Active Pipeline)
 */
function createPrestigeAuto(): Customer {
  const baseDate = new Date('2025-10-10');
  const customerName = 'Prestige Auto Group';
  const agentName = 'Sarah Mitchell';
  return {
    id: 'cust-004',
    name: customerName,
    stage: 'prospect',
    healthScore: 0,
    mrr: 0,
    tenure: 0,
    riskLevel: 'low',
    lastContactDays: 0,
    assignedTo: agentName,
    interactions: [
      createJourneyEvent({
        id: 'int-004-01',
        customer_id: 'cust-004',
        ts: baseDate.toISOString(),
        stage: 'Acquisition',
        channel: 'voice',
        title: '☎️ Outbound prospecting call',
        summary: 'Spoke with Tom (General Manager). Interested but wants to see ROI data first.',
        durationSec: 12 * 60,
        agent: agentName,
        customer: customerName,
        tags: [],
        score: { risk: 20, opportunity: 70 },
        participants: ['Tom Rodriguez (GM)', agentName],
        recommendedActions: [createRecommendedAction('Send automotive ROI case studies')],
      }),
      createJourneyEvent({
        id: 'int-004-02',
        customer_id: 'cust-004',
        ts: addDays(baseDate, 2).toISOString(),
        stage: 'Acquisition',
        channel: 'email',
        title: '📧 ROI documentation sent',
        summary: 'Sent Professional plan pricing and 3 automotive dealership success stories.',
        agent: agentName,
        customer: customerName,
        tags: ['opportunity'],
        score: { risk: 15, opportunity: 75 },
        participants: [agentName],
      }),
      createJourneyEvent({
        id: 'int-004-03',
        customer_id: 'cust-004',
        ts: addDays(baseDate, 10).toISOString(),
        stage: 'Acquisition',
        channel: 'voice',
        title: '📞 Follow-up - Budget discussion',
        summary: 'Tom reviewing with ownership. Budget approved but moving slowly. Q1 2026 start likely.',
        durationSec: 15 * 60,
        agent: agentName,
        customer: customerName,
        tags: ['opportunity'],
        score: { risk: 10, opportunity: 80 },
        participants: ['Tom Rodriguez (GM)', agentName],
      }),
    ],
  };
}

/**
 * 5. Elite Landscaping - CHAMPION (Expansion Ready)
 */
function createEliteLandscaping(): Customer {
    const baseDate = new Date('2025-03-01');
    const customerName = 'Elite Landscaping';
    const agentName = 'Marcus Johnson';
    return {
        id: 'cust-005',
        name: customerName,
        stage: 'active',
        healthScore: 0,
        mrr: 595,
        tenure: 9,
        riskLevel: 'low',
        lastContactDays: 0,
        assignedTo: agentName,
        interactions: [
            createJourneyEvent({
                id: 'int-005-01',
        customer_id: 'cust-005',
                ts: baseDate.toISOString(),
                stage: 'Acquisition',
                channel: 'voice',
                title: '🌟 Referral call - High intent',
                summary: 'Referred by Golden Dragon. Already sold on value. Ready to sign.',
                durationSec: 15 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 5, opportunity: 95 },
                participants: ['Lisa Anderson (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-005-02',
        customer_id: 'cust-005',
                ts: addDays(baseDate, 1).toISOString(),
                stage: 'Onboarding',
                channel: 'voice',
                title: '⚡ Fast close - Same week!',
                summary: 'Lisa signed Professional plan. Excited about spring season growth.',
                durationSec: 10 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 2, opportunity: 98 },
                participants: ['Lisa Anderson (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-005-03',
        customer_id: 'cust-005',
                ts: addDays(baseDate, 60).toISOString(),
                stage: 'Support',
                channel: 'voice',
                title: '📈 60-day review - Incredible results',
                summary: 'Calls up 300%! Lisa hired 3 new employees. Business booming.',
                durationSec: 30 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 5, opportunity: 90 },
                participants: ['Lisa Anderson (Owner)', agentName],
                transcript: `Lisa: Marcus, I have to tell you - this has been life-changing. We're getting 15 calls a week now!\n\nMarcus: That's amazing Lisa! How's business growth?\n\nLisa: We've hired 3 new people and I'm opening a second location in the next county.\n\nMarcus: Congratulations! We can extend your plan to cover that location too.\n\nLisa: How much?\n\nMarcus: Just $395 more per month for the second location.\n\nLisa: Let me get it set up and we'll definitely talk in a few months.`,
                aiInsights: [createAIInsight('🚀', 'Expansion: Second location', 'Customer opening new location. Strong upsell potential.')],
                recommendedActions: [createRecommendedAction('Follow up in 2 months about second location')],
            }),
            createJourneyEvent({
                id: 'int-005-04',
        customer_id: 'cust-005',
                ts: addDays(baseDate, 120).toISOString(),
                stage: 'Support',
                channel: 'email',
                title: '✉️ Check-in on expansion plans',
                summary: 'Following up on second location opening timeline.',
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 5, opportunity: 50 },
                participants: [agentName],
            }),
            createJourneyEvent({
                id: 'int-005-05',
        customer_id: 'cust-005',
                ts: addDays(baseDate, 180).toISOString(),
                stage: 'Renewal',
                channel: 'voice',
                title: '🎯 Second location confirmed',
                summary: 'New location opens next month. Ready to add to VIA platform.',
                durationSec: 18 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 5, opportunity: 95 },
                participants: ['Lisa Anderson (Owner)', agentName],
            }),
        ],
    };
}

/**
 * 6. Metro Carpet Care - MEDIUM RISK (Engagement Gap)
 */
function createMetroCarpetCare(): Customer {
    const baseDate = new Date('2025-05-01');
    const customerName = 'Metro Carpet Care';
    const agentName = 'Sarah Mitchell';
    return {
        id: 'cust-006',
        name: customerName,
        stage: 'active',
        healthScore: 0,
        mrr: 395,
        tenure: 7,
        riskLevel: 'medium',
        lastContactDays: 0,
        assignedTo: agentName,
        interactions: [
            createJourneyEvent({
                id: 'int-006-01',
        customer_id: 'cust-006',
                ts: baseDate.toISOString(),
                stage: 'Acquisition',
                channel: 'voice',
                title: '📞 Initial call - Carpet cleaning business',
                summary: 'Steve wants more commercial contracts. Currently mostly residential.',
                durationSec: 20 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 15, opportunity: 80 },
                participants: ['Steve Palmer (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-006-02',
        customer_id: 'cust-006',
                ts: addDays(baseDate, 5).toISOString(),
                stage: 'Onboarding',
                channel: 'voice',
                title: '✅ Signed - Professional plan',
                summary: 'Steve signed $395/mo. Wants to compete with major chains.',
                durationSec: 14 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 10, opportunity: 90 },
                participants: ['Steve Palmer (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-006-03',
        customer_id: 'cust-006',
                ts: addDays(baseDate, 40).toISOString(),
                stage: 'Support',
                channel: 'voice',
                title: '📊 First month review - Solid start',
                summary: 'Lead volume up 40%. Steve satisfied with early results.',
                durationSec: 18 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 10, opportunity: 70 },
                participants: ['Steve Palmer (Owner)', agentName],
            }),
            // === GAP: 60 days of silence ===
            createJourneyEvent({
                id: 'int-006-04',
        customer_id: 'cust-006',
                ts: addDays(baseDate, 100).toISOString(),
                stage: 'Support',
                channel: 'chat',
                title: '⚠️ Product usage declining',
                summary: 'Steve only logging in 1x/month. Low engagement detected.',
                agent: agentName,
                customer: customerName,
                tags: ['risk'],
                score: { risk: 50, opportunity: 20 },
                aiInsights: [createAIInsight('📉', 'Engagement dropping', 'Customer not actively using platform. Needs check-in.')],
                recommendedActions: [createRecommendedAction('Schedule proactive health check call')],
            }),
        ],
    };
}

/**
 * 7. Urban Dental Group - HEALTHY (Regular Contact)
 */
function createUrbanDentalGroup(): Customer {
    const baseDate = new Date('2025-04-01');
    const customerName = 'Urban Dental Group';
    const agentName = 'Jennifer Lopez';
    return {
        id: 'cust-007',
        name: customerName,
        stage: 'active',
        healthScore: 0,
        mrr: 545,
        tenure: 8,
        riskLevel: 'low',
        lastContactDays: 0,
        assignedTo: agentName,
        interactions: [
            createJourneyEvent({
                id: 'int-007-01',
        customer_id: 'cust-007',
                ts: baseDate.toISOString(),
                stage: 'Acquisition',
                channel: 'voice',
                title: '🦷 Discovery - Dental practice growth',
                summary: 'Dr. Patel wants to fill appointment gaps and attract new patients.',
                durationSec: 25 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 10, opportunity: 85 },
                participants: ['Dr. Priya Patel (Practice Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-007-02',
        customer_id: 'cust-007',
                ts: addDays(baseDate, 4).toISOString(),
                stage: 'Onboarding',
                channel: 'voice',
                title: '✅ Contract signed',
                summary: 'Dr. Patel signed Professional plan ($545/mo). Focus on new patient acquisition.',
                durationSec: 16 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 5, opportunity: 95 },
                participants: ['Dr. Priya Patel', agentName],
            }),
            createJourneyEvent({
                id: 'int-007-03',
        customer_id: 'cust-007',
                ts: addDays(baseDate, 30).toISOString(),
                stage: 'Support',
                channel: 'voice',
                title: '📈 30-day review - Strong performance',
                summary: 'New patient calls up 60%. Dr. Patel very happy.',
                durationSec: 20 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 5, opportunity: 80 },
                participants: ['Dr. Priya Patel', agentName],
            }),
            createJourneyEvent({
                id: 'int-007-04',
        customer_id: 'cust-007',
                ts: addDays(baseDate, 60).toISOString(),
                stage: 'Support',
                channel: 'voice',
                title: '✅ 60-day check-in',
                summary: 'Consistent results. Schedule filling up nicely. Happy customer.',
                durationSec: 15 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 5, opportunity: 70 },
                participants: ['Dr. Priya Patel', agentName],
            }),
            createJourneyEvent({
                id: 'int-007-05',
        customer_id: 'cust-007',
                ts: addDays(baseDate, 90).toISOString(),
                stage: 'Renewal',
                channel: 'voice',
                title: '📊 Quarterly business review',
                summary: 'Practice growth 25% quarter-over-quarter. Dr. Patel is a strong champion.',
                durationSec: 30 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 2, opportunity: 85 },
                participants: ['Dr. Priya Patel', agentName],
            }),
            createJourneyEvent({
                id: 'int-007-06',
        customer_id: 'cust-007',
                ts: addDays(baseDate, 120).toISOString(),
                stage: 'Renewal',
                channel: 'email',
                title: '💬 Monthly touch-base',
                summary: 'Regular check-in. Everything running smoothly.',
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 2, opportunity: 60 },
                participants: [agentName],
            }),
        ],
    };
}

/**
 * 8. Coastal HVAC - HIGH RISK (Payment Issues)
 */
function createCoastalHVAC(): Customer {
    const baseDate = new Date('2025-07-01');
    const customerName = 'Coastal HVAC Services';
    const agentName = 'Marcus Johnson';
    return {
        id: 'cust-008',
        name: customerName,
        stage: 'at-risk',
        healthScore: 0,
        mrr: 495,
        tenure: 5,
        riskLevel: 'high',
        lastContactDays: 0,
        assignedTo: agentName,
        interactions: [
            createJourneyEvent({
                id: 'int-008-01',
        customer_id: 'cust-008',
                ts: baseDate.toISOString(),
                stage: 'Acquisition',
                channel: 'voice',
                title: '❄️ HVAC contractor - Seasonal business',
                summary: 'Dan wants to smooth out seasonal revenue fluctuations.',
                durationSec: 22 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 20, opportunity: 75 },
                participants: ['Dan Foster (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-008-02',
        customer_id: 'cust-008',
                ts: addDays(baseDate, 3).toISOString(),
                stage: 'Onboarding',
                channel: 'voice',
                title: '✅ Signed - Professional plan',
                summary: 'Dan signed $495/mo. Seasonal business means cash flow can be tight.',
                durationSec: 18 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 15, opportunity: 85 },
                participants: ['Dan Foster (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-008-03',
        customer_id: 'cust-008',
                ts: addDays(baseDate, 35).toISOString(),
                stage: 'Support',
                channel: 'voice',
                title: '🌡️ Early results - Summer rush',
                summary: 'Emergency calls up 80%. Dan thrilled with summer performance.',
                durationSec: 16 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 10, opportunity: 90 },
                participants: ['Dan Foster (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-008-04',
        customer_id: 'cust-008',
                ts: addDays(baseDate, 90).toISOString(),
                stage: 'Support',
                channel: 'crm',
                title: '⚠️ Payment failed - Card declined',
                summary: 'Monthly payment declined. Attempted 3 times. Dan not responding to emails.',
                agent: 'Billing',
                customer: customerName,
                tags: ['risk', 'flag'],
                score: { risk: 80, opportunity: 0 },
                aiInsights: [createAIInsight('💳', 'Payment failure + silence', 'Customer may be experiencing cash flow issues')],
                recommendedActions: [createRecommendedAction('Call customer immediately about payment')],
            }),
            createJourneyEvent({
                id: 'int-008-05',
        customer_id: 'cust-008',
                ts: addDays(baseDate, 93).toISOString(),
                stage: 'Support',
                channel: 'voice',
                title: '💰 Payment discussion - Financial pressure',
                summary: 'Dan hit by slow season earlier than expected. Cash tight. Promised payment Friday.',
                durationSec: 12 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['risk'],
                score: { risk: 60, opportunity: 10 },
                participants: ['Dan Foster (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-008-06',
        customer_id: 'cust-008',
                ts: addDays(baseDate, 96).toISOString(),
                stage: 'Support',
                channel: 'crm',
                title: '✅ Payment received - Crisis averted',
                summary: 'Payment processed successfully. Need to monitor closely.',
                agent: 'Billing',
                customer: customerName,
                tags: [],
                score: { risk: 40, opportunity: 30 },
                aiInsights: [createAIInsight('⚠️', 'Financial instability risk', 'May face future payment issues. Consider payment plan.')],
            }),
        ],
    };
}

/**
 * 9. Prime Locksmith - CHURNED (Post-Mortem Analysis)
 */
function createPrimeLocksmith(): Customer {
    const baseDate = new Date('2025-01-15');
    const customerName = 'Prime Locksmith';
    const agentName = 'Sarah Mitchell';
    return {
        id: 'cust-009',
        name: customerName,
        stage: 'churned',
        healthScore: 0,
        mrr: 0,
        tenure: 4,
        riskLevel: 'critical',
        lastContactDays: 0,
        assignedTo: agentName,
        interactions: [
            createJourneyEvent({
                id: 'int-009-01',
        customer_id: 'cust-009',
                ts: baseDate.toISOString(),
                stage: 'Acquisition',
                channel: 'voice',
                title: '🔑 Locksmith discovery call',
                summary: 'Tony interested in Basic plan. Budget-conscious, price-sensitive.',
                durationSec: 14 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 30, opportunity: 60 },
                participants: ['Tony Russo (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-009-02',
        customer_id: 'cust-009',
                ts: addDays(baseDate, 6).toISOString(),
                stage: 'Onboarding',
                channel: 'voice',
                title: '✅ Signed Basic plan',
                summary: 'Tony signed lowest tier ($245/mo). Very price-focused.',
                durationSec: 10 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 25, opportunity: 70 },
                participants: ['Tony Russo (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-009-03',
        customer_id: 'cust-009',
                ts: addDays(baseDate, 30).toISOString(),
                stage: 'Support',
                channel: 'voice',
                title: '📊 30-day check - Lukewarm results',
                summary: 'Modest increase in calls. Tony expecting more for the price.',
                durationSec: 12 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 40, opportunity: 50 },
                participants: ['Tony Russo (Owner)', agentName],
            }),
            // === GAP: 45 days ===
            createJourneyEvent({
                id: 'int-009-04',
        customer_id: 'cust-009',
                ts: addDays(baseDate, 75).toISOString(),
                stage: 'Support',
                channel: 'email',
                title: '📧 Outreach after silence',
                summary: 'Attempted to reach Tony. No response.',
                agent: agentName,
                customer: customerName,
                tags: ['risk'],
                score: { risk: 60, opportunity: 10 },
                participants: [agentName],
            }),
            createJourneyEvent({
                id: 'int-009-05',
        customer_id: 'cust-009',
                ts: addDays(baseDate, 90).toISOString(),
                stage: 'Support',
                channel: 'voice',
                title: '⚠️ Cancellation notice received',
                summary: 'Tony canceling. Found cheaper competitor at $195/mo. Price was only decision factor.',
                durationSec: 8 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['risk', 'flag'],
                score: { risk: 95, opportunity: 0 },
                participants: ['Tony Russo (Owner)', agentName],
                transcript: `Sarah: Hi Tony, I got your cancellation request. Can we discuss?\n\nTony: I found someone cheaper - $195/mo vs your $245.\n\nSarah: I understand price matters. Can we talk about the value difference?\n\nTony: Not really interested. Already committed to the other company. Thanks anyway.`,
                aiInsights: [
                    createAIInsight('💸', 'Price-driven churn', 'Customer focused solely on cost, not value. Unable to demonstrate ROI.'),
                    createAIInsight('⚔️', 'Lost to low-cost competitor', 'Competitor undercut pricing by 20%'),
                ],
            }),
            createJourneyEvent({
                id: 'int-009-06',
        customer_id: 'cust-009',
                ts: addDays(baseDate, 120).toISOString(),
                stage: 'Renewal',
                channel: 'crm',
                title: '🚪 Account closed',
                summary: 'Subscription canceled. Customer churned.',
                agent: 'System',
                customer: customerName,
                tags: [],
                score: { risk: 100, opportunity: 0 },
            }),
        ],
    };
}

/**
 * 10. Apex Electrical - EXPANSION SUCCESS (Multi-Location Champion)
 */
function createApexElectrical(): Customer {
    const baseDate = new Date('2024-12-01');
    const customerName = 'Apex Electrical Solutions';
    const agentName = 'Jennifer Lopez';
    return {
        id: 'cust-010',
        name: customerName,
        stage: 'expansion',
        healthScore: 0,
        mrr: 1195,
        tenure: 12,
        riskLevel: 'low',
        lastContactDays: 0,
        assignedTo: agentName,
        interactions: [
            createJourneyEvent({
                id: 'int-010-01',
        customer_id: 'cust-010',
                ts: baseDate.toISOString(),
                stage: 'Acquisition',
                channel: 'voice',
                title: '⚡ Electrical contractor - Single location',
                summary: 'Carlos wants to dominate local market. Ambitious growth plans.',
                durationSec: 28 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 5, opportunity: 90 },
                participants: ['Carlos Martinez (CEO)', agentName],
            }),
            createJourneyEvent({
                id: 'int-010-02',
        customer_id: 'cust-010',
                ts: addDays(baseDate, 2).toISOString(),
                stage: 'Onboarding',
                channel: 'voice',
                title: '✅ Fast close - Professional plan',
                summary: 'Carlos signed $595/mo. Wants aggressive growth. High energy customer.',
                durationSec: 20 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 2, opportunity: 98 },
                participants: ['Carlos Martinez (CEO)', agentName],
            }),
            createJourneyEvent({
                id: 'int-010-03',
        customer_id: 'cust-010',
                ts: addDays(baseDate, 60).toISOString(),
                stage: 'Support',
                channel: 'voice',
                title: '🚀 60-day review - Explosive growth',
                summary: 'Calls up 250%. Carlos hired 4 electricians. Revenue doubled.',
                durationSec: 35 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 5, opportunity: 95 },
                participants: ['Carlos Martinez (CEO)', agentName],
            }),
            createJourneyEvent({
                id: 'int-010-04',
        customer_id: 'cust-010',
                ts: addDays(baseDate, 120).toISOString(),
                stage: 'Renewal',
                channel: 'voice',
                title: '🏢 Expansion announcement - 2nd location!',
                summary: 'Carlos opening second location 30 miles away. Wants to add to plan.',
                durationSec: 22 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 5, opportunity: 90 },
                participants: ['Carlos Martinez (CEO)', agentName],
            }),
            createJourneyEvent({
                id: 'int-010-05',
        customer_id: 'cust-010',
                ts: addDays(baseDate, 125).toISOString(),
                stage: 'Renewal',
                channel: 'voice',
                title: '💰 Upsell closed - Location 2 added',
                summary: 'Added second location for +$395/mo. Now paying $990/mo total.',
                durationSec: 15 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 2, opportunity: 98 },
                participants: ['Carlos Martinez (CEO)', agentName],
            }),
            createJourneyEvent({
                id: 'int-010-06',
        customer_id: 'cust-010',
                ts: addDays(baseDate, 240).toISOString(),
                stage: 'Renewal',
                channel: 'voice',
                title: '🏆 Location 3 announced - Becoming regional!',
                summary: 'Carlos planning third location. Wants Enterprise tier with centralized dashboard.',
                durationSec: 40 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 5, opportunity: 95 },
                participants: ['Carlos Martinez (CEO)', agentName],
                aiInsights: [createAIInsight('🎯', 'Enterprise upgrade opportunity', 'Customer growing into Enterprise tier. Perfect timing.')],
            }),
            createJourneyEvent({
                id: 'int-010-07',
        customer_id: 'cust-010',
                ts: addDays(baseDate, 250).toISOString(),
                stage: 'Renewal',
                channel: 'voice',
                title: '🎉 Enterprise tier closed - 3 locations',
                summary: 'Upgraded to Enterprise with 3-location package. Now $1,195/mo. Major win!',
                durationSec: 25 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 1, opportunity: 100 },
                participants: ['Carlos Martinez (CEO)', agentName],
            }),
            createJourneyEvent({
                id: 'int-010-08',
        customer_id: 'cust-010',
                ts: addDays(baseDate, 280).toISOString(),
                stage: 'Renewal',
                channel: 'voice',
                title: '🌟 Referral source - Gave us 2 leads',
                summary: 'Carlos referred 2 other electrical contractors. Strong champion.',
                durationSec: 18 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 1, opportunity: 80 },
                participants: ['Carlos Martinez (CEO)', agentName],
            }),
        ],
    };
}

/**
 * 11. Silver Oak Catering - ADOPTION PHASE
 */
function createSilverOakCatering(): Customer {
    const baseDate = new Date('2025-09-01');
    const customerName = 'Silver Oak Catering';
    const agentName = 'Marcus Johnson';
    return {
        id: 'cust-011',
        name: customerName,
        stage: 'adoption',
        healthScore: 0,
        mrr: 445,
        tenure: 3,
        riskLevel: 'medium',
        lastContactDays: 0,
        assignedTo: agentName,
        interactions: [
            createJourneyEvent({
                id: 'int-011-01',
        customer_id: 'cust-011',
                ts: baseDate.toISOString(),
                stage: 'Acquisition',
                channel: 'voice',
                title: '🍽️ Catering company discovery',
                summary: 'Michelle wants more corporate event inquiries. Not tech-savvy.',
                durationSec: 24 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 20, opportunity: 70 },
                participants: ['Michelle Davis (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-011-02',
        customer_id: 'cust-011',
                ts: addDays(baseDate, 8).toISOString(),
                stage: 'Onboarding',
                channel: 'voice',
                title: '✅ Signed - Needs extra training',
                summary: 'Michelle signed $445/mo. Will need extra onboarding support. Not comfortable with tech.',
                durationSec: 22 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 30, opportunity: 80 },
                participants: ['Michelle Davis (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-011-03',
        customer_id: 'cust-011',
                ts: addDays(baseDate, 12).toISOString(),
                stage: 'Onboarding',
                channel: 'crm',
                title: '❓ Support ticket - Login issues',
                summary: 'Michelle having trouble accessing dashboard. Forgot password 3 times.',
                durationSec: 15 * 60,
                agent: 'Support Team',
                customer: customerName,
                tags: ['risk'],
                score: { risk: 50, opportunity: 20 },
                participants: ['Michelle Davis (Owner)', 'Support Team'],
            }),
            createJourneyEvent({
                id: 'int-011-04',
        customer_id: 'cust-011',
                ts: addDays(baseDate, 18).toISOString(),
                stage: 'Onboarding',
                channel: 'voice',
                title: '📚 Extra training session',
                summary: 'Walked Michelle through platform step-by-step. She is improving.',
                durationSec: 40 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 30, opportunity: 40 },
                participants: ['Michelle Davis (Owner)', agentName],
            }),
            createJourneyEvent({
                id: 'int-011-05',
        customer_id: 'cust-011',
                ts: addDays(baseDate, 45).toISOString(),
                stage: 'Support',
                channel: 'voice',
                title: '🎯 Starting to see value',
                summary: 'Michelle finally comfortable with platform. Event inquiries up 30%.',
                durationSec: 16 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 15, opportunity: 70 },
                participants: ['Michelle Davis (Owner)', agentName],
            }),
        ],
    };
}

/**
 * 12. Peak Construction Co - ENTERPRISE COMPLEX
 */
function createPeakConstructionCo(): Customer {
    const baseDate = new Date('2025-07-01');
    const customerName = 'Peak Construction Co';
    const agentName = 'Jennifer Lopez';
    return {
        id: 'cust-012',
        name: customerName,
        stage: 'prospect',
        healthScore: 0,
        mrr: 0,
        tenure: 0,
        riskLevel: 'low',
        lastContactDays: 0,
        assignedTo: agentName,
        interactions: [
            createJourneyEvent({
                id: 'int-012-01',
        customer_id: 'cust-012',
                ts: baseDate.toISOString(),
                stage: 'Acquisition',
                channel: 'crm',
                title: '🏗️ Enterprise demo - Multi-stakeholder',
                summary: 'Presented to COO, Marketing Director, and 5 Division Managers. Complex decision-making process.',
                durationSec: 60 * 60,
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 25, opportunity: 75 },
                participants: ['James Sullivan (COO)', 'Marketing Team', agentName],
            }),
            createJourneyEvent({
                id: 'int-012-02',
        customer_id: 'cust-012',
                ts: addDays(baseDate, 14).toISOString(),
                stage: 'Acquisition',
                channel: 'email',
                title: '📧 Enterprise proposal sent',
                summary: 'Sent comprehensive proposal for 5-location Enterprise package ($1,495/mo).',
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 20, opportunity: 80 },
                participants: [agentName],
            }),
            createJourneyEvent({
                id: 'int-012-03',
        customer_id: 'cust-012',
                ts: addDays(baseDate, 30).toISOString(),
                stage: 'Acquisition',
                channel: 'crm',
                title: '💼 Executive stakeholder meeting',
                summary: 'Presenting to C-suite. CFO concerned about ROI. Need to provide more data.',
                durationSec: 45 * 60,
                agent: agentName,
                customer: customerName,
                tags: [],
                score: { risk: 40, opportunity: 60 },
                participants: ['James Sullivan (COO)', 'CFO', agentName],
                aiInsights: [createAIInsight('📊', 'CFO skepticism - Need ROI proof', 'Financial stakeholder needs stronger business case')],
                recommendedActions: [createRecommendedAction('Prepare detailed ROI analysis with construction industry benchmarks')],
            }),
            createJourneyEvent({
                id: 'int-012-04',
        customer_id: 'cust-012',
                ts: addDays(baseDate, 45).toISOString(),
                stage: 'Acquisition',
                channel: 'email',
                title: '📊 ROI analysis sent',
                summary: 'Sent comprehensive ROI breakdown showing 400% return in year 1 based on construction industry data.',
                agent: agentName,
                customer: customerName,
                tags: ['opportunity'],
                score: { risk: 30, opportunity: 70 },
                participants: [agentName],
            }),
        ],
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
 * Create journey event with defaults
 */
function createJourneyEvent(data: Partial<JourneyEvent> & {
  id: string;
  ts: string;
  stage: JourneyStage;
  channel: ChannelType;
  title: string;
  summary: string;
  agent: string;
  customer: string;
  customer_id: string;
}): JourneyEvent {
  const conversationId = `conv-${Math.random().toString(36).substring(7)}`;

  // Derive priority from tags and risk score
  const tags = data.tags || [];
  const score = data.score || { risk: 0, opportunity: 0 };
  let priority: PriorityLevel = 'none';

  if (tags.includes('risk') || score.risk >= 70) {
    priority = score.risk >= 85 ? 'critical' : 'high';
  } else if (tags.includes('opportunity') || score.opportunity >= 80) {
    priority = 'medium';
  } else if (score.risk >= 50) {
    priority = 'low';
  }

  // Derive weight from priority and risk
  let weight = 50;
  if (priority === 'critical') weight = 90;
  else if (priority === 'high') weight = 75;
  else if (priority === 'medium') weight = 60;
  else if (priority === 'low') weight = 40;

  return {
    durationSec: 0,
    tags: [],
    score: { risk: 0, opportunity: 0 },
    conversation_id: conversationId,
    span_id: `span-${Math.random().toString(36).substring(7)}`,
    record: {
      system: 'Salesforce',
      object: 'Case',
      record_id: `case-${Math.random().toString(36).substring(7)}`,
    },
    participants: [],
    aiInsights: [],
    recommendedActions: [],
    sentiment: 'neutral',
    priority,
    weight,
    ...data,
  };
}

/**
 * Create AI insight helper
 */
function createAIInsight(
  icon: string,
  title: string,
  description: string,
): AIInsight {
  return {
    id: `ai-${Math.random().toString(36).substring(7)}`,
    icon,
    title,
    description,
  };
}

/**
 * Create recommended action helper
 */
function createRecommendedAction(
  title: string,
): RecommendedAction {
  return {
    id: `act-${Math.random().toString(36).substring(7)}`,
    title,
  };
}

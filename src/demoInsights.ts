import type { InsightDataL2 } from './insightTypes';

export const demoInsights: InsightDataL2[] = [
  {
    id: 'insight_001',
    title: 'High churn risk detected in Enterprise segment',
    channel: 'voice',
    timestamp: '2025-11-05T14:30:00Z',
    category: 'Churn Risk',
    problem: 'Three Enterprise customers expressed frustration about integration complexity during support calls. Average call duration increased 40% compared to baseline, indicating escalating technical barriers.',
    recommendation: 'Deploy Solutions Engineering team for white-glove integration audit. Schedule executive business review within 7 days. Consider temporary premium support tier upgrade.',
    evidence: {
      tickets: 12,
      projected_improvement_pct: 25
    },
    badge: {
      label: 'ARR at Risk',
      value: '$240K'
    },
    summary: [
      'Integration pain points mentioned in 12 support tickets over 14 days',
      'Average resolution time increased from 45min to 63min (+40%)',
      'Negative sentiment detected in 75% of recent interactions',
      'Three customers threatened escalation to management'
    ],
    actions: [
      'Schedule Solutions Engineering deep-dive this week',
      'Send executive summary to VP of Customer Success',
      'Create dedicated Slack channel for priority support'
    ],
    linked_tickets: [
      {
        id: 'TKT-4521',
        created: '2025-11-03T10:15:00Z',
        sentiment: 'negative',
        agent: 'Sarah Chen',
        resolution: 'Escalated',
        duration_sec: 1820
      },
      {
        id: 'TKT-4498',
        created: '2025-11-01T16:45:00Z',
        sentiment: 'negative',
        agent: 'Mike Rodriguez',
        resolution: 'Partial',
        duration_sec: 2340
      },
      {
        id: 'TKT-4467',
        created: '2025-10-28T09:20:00Z',
        sentiment: 'neutral',
        agent: 'Sarah Chen',
        resolution: 'Workaround',
        duration_sec: 1560
      }
    ],
    impact: {
      kpi: 'Churn Rate',
      delta_pct: -8,
      window_days: 30,
      scope: 'Enterprise segment'
    },
    evidence_l2: {
      spans: [
        {
          ticket_id: 'TKT-4521',
          startSec: 145,
          endSec: 178,
          text: "We've been trying to get this Salesforce integration working for three weeks now. Our sales team is getting really frustrated and we're considering other solutions."
        },
        {
          ticket_id: 'TKT-4498',
          startSec: 302,
          endSec: 335,
          text: "The documentation doesn't match what we're seeing in the API. We've had to write custom workarounds for everything. This is taking way more engineering time than we budgeted."
        },
        {
          ticket_id: 'TKT-4467',
          startSec: 89,
          endSec: 112,
          text: "I need to escalate this to my manager. We can't go live without this integration working properly."
        }
      ],
      audio: {
        url: 'https://example.com/audio/TKT-4521.mp3',
        duration_sec: 1820
      },
      provenance: [
        {
          metric: 'Churn Risk Score',
          source: 'ML Model v2.3',
          window: 'Last 30 days',
          query: "SELECT churn_score FROM predictions WHERE segment='Enterprise'"
        },
        {
          metric: 'Sentiment Analysis',
          source: 'NLP Pipeline',
          window: 'Last 14 days',
          query: 'ANALYZE sentiment FROM transcripts WHERE customer_id IN (...)'
        }
      ],
      calculations: [
        {
          name: 'Average Resolution Time',
          value: '63 minutes',
          window: 'Last 14 days',
          method: "AVG(duration_sec) WHERE category='Integration'"
        },
        {
          name: 'Sentiment Trend',
          value: '-32% decline',
          window: 'Last 30 days',
          method: 'SLOPE(sentiment_score) OVER 30d window'
        }
      ],
      related_records: [
        {
          system: 'Salesforce',
          object: 'Account',
          record_id: 'ACC-98234',
          url: 'https://salesforce.com/ACC-98234'
        },
        {
          system: 'Zendesk',
          object: 'Ticket',
          record_id: 'TKT-4521',
          url: 'https://zendesk.com/TKT-4521'
        }
      ]
    }
  },
  {
    id: 'insight_002',
    title: 'Product feedback trending: Request for mobile app',
    channel: 'email',
    timestamp: '2025-11-04T09:15:00Z',
    category: 'Product Feedback',
    problem: 'Mobile app requests increased 300% in the past quarter across all customer segments. Field teams report significant productivity loss due to lack of mobile access.',
    recommendation: 'Prioritize mobile MVP for Q1 2026 roadmap. Survey top 20 customers for feature requirements. Create mobile-first product committee.',
    evidence: {
      tickets: 28,
      projected_improvement_pct: 15
    },
    summary: [
      '28 explicit requests for mobile app in last 90 days',
      'Mentioned by 15 different customers across 4 segments',
      'Correlated with 12% lower usage scores in field sales teams',
      'Competitive intelligence shows 3 of 5 competitors launched mobile this year'
    ],
    actions: [
      'Survey top customers for mobile feature requirements',
      'Create business case for Q1 2026 mobile MVP',
      'Schedule product roadmap review with leadership'
    ],
    linked_tickets: [
      {
        id: 'TKT-4890',
        created: '2025-11-02T14:22:00Z',
        sentiment: 'neutral',
        agent: 'Emma Watson',
        resolution: 'Logged',
        duration_sec: 420
      },
      {
        id: 'TKT-4756',
        created: '2025-10-28T11:30:00Z',
        sentiment: 'positive',
        agent: 'David Kim',
        resolution: 'Logged',
        duration_sec: 310
      }
    ],
    impact: {
      kpi: 'Product Satisfaction',
      delta_pct: 15,
      window_days: 90,
      scope: 'All segments'
    },
    evidence_l2: {
      spans: [
        {
          ticket_id: 'TKT-4890',
          startSec: 45,
          endSec: 68,
          text: "Our field reps are constantly asking when we'll have a mobile app. They need to access customer data while on the road."
        },
        {
          ticket_id: 'TKT-4756',
          startSec: 120,
          endSec: 145,
          text: "Love the product overall, but really wish we had mobile access. Sometimes I need to check things when I'm away from my desk."
        }
      ],
      audio: {
        url: 'https://example.com/audio/TKT-4890.mp3',
        duration_sec: 420
      },
      provenance: [
        {
          metric: 'Feature Request Count',
          source: 'Support Ticket Database',
          window: 'Last 90 days',
          query: "SELECT COUNT(*) FROM tickets WHERE tags LIKE '%mobile%'"
        }
      ],
      calculations: [
        {
          name: 'Request Growth Rate',
          value: '+300%',
          window: 'QoQ comparison',
          method: "COMPARE(Q3_2025, Q2_2025) GROUP BY feature_tag"
        }
      ],
      related_records: [
        {
          system: 'ProductBoard',
          object: 'Feature Request',
          record_id: 'FR-123',
          url: 'https://productboard.com/FR-123'
        }
      ]
    }
  },
  {
    id: 'insight_003',
    title: 'Upsell opportunity: Premium features for Mid-Market',
    channel: 'chat',
    timestamp: '2025-11-03T16:45:00Z',
    category: 'Upsell Opportunity',
    problem: 'Mid-Market customers asking about Enterprise features during support interactions. 8 customers hit usage limits on Standard plan in October.',
    recommendation: 'Create targeted upsell campaign for Mid-Market segment. Offer 30-day trial of Premium features. Train support team on value-based upsell messaging.',
    evidence: {
      tickets: 16,
      projected_improvement_pct: 35
    },
    badge: {
      label: 'Revenue Opportunity',
      value: '$180K'
    },
    summary: [
      '8 customers hit usage limits on Standard plan last month',
      '16 support tickets mentioned Enterprise-tier features',
      'Average customer LTV would increase $22.5K with Premium upgrade',
      'Competitors offering similar features at same price point'
    ],
    actions: [
      'Create Premium trial offer for qualified Mid-Market accounts',
      'Train CSM team on value-based upgrade conversations',
      'Send personalized feature comparison to top 10 candidates'
    ],
    linked_tickets: [
      {
        id: 'TKT-5012',
        created: '2025-10-30T13:15:00Z',
        sentiment: 'positive',
        agent: 'Jessica Lee',
        resolution: 'Closed',
        duration_sec: 540
      },
      {
        id: 'TKT-4987',
        created: '2025-10-27T10:05:00Z',
        sentiment: 'neutral',
        agent: 'Tom Harris',
        resolution: 'Closed',
        duration_sec: 720
      }
    ],
    impact: {
      kpi: 'ARR Growth',
      delta_pct: 35,
      window_days: 60,
      scope: 'Mid-Market segment'
    },
    evidence_l2: {
      spans: [
        {
          ticket_id: 'TKT-5012',
          startSec: 67,
          endSec: 89,
          text: "We're hitting our user limits pretty consistently now. What options do we have to add more seats or upgrade?"
        },
        {
          ticket_id: 'TKT-4987',
          startSec: 234,
          endSec: 267,
          text: "I saw that the Enterprise plan has advanced analytics. That would be really useful for our quarterly reporting. How much would it cost to upgrade?"
        }
      ],
      audio: {
        url: 'https://example.com/audio/TKT-5012.mp3',
        duration_sec: 540
      },
      provenance: [
        {
          metric: 'Usage Limit Events',
          source: 'Application Logs',
          window: 'Last 30 days',
          query: 'SELECT customer_id FROM usage_events WHERE limit_reached=true'
        }
      ],
      calculations: [
        {
          name: 'Incremental LTV',
          value: '$22,500 per customer',
          window: '24-month contract',
          method: 'AVG(Premium_MRR - Standard_MRR) * 24'
        }
      ],
      related_records: [
        {
          system: 'Stripe',
          object: 'Subscription',
          record_id: 'SUB-78234',
          url: 'https://stripe.com/SUB-78234'
        }
      ]
    }
  }
];

export const demoInsightsById = Object.fromEntries(demoInsights.map((insight) => [insight.id, insight]));

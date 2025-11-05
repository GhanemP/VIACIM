import React, { useState, useMemo, useEffect } from "react";

// Types
type Stage = "prospecting" | "qualification" | "demo" | "proposal" | "negotiation" | "closed";
type Type = "call" | "email" | "meeting" | "crm" | "linkedin" | "chat";
type Tag = "risk" | "opportunity" | "champion" | "competitor" | "blocker" | "urgency";
type Sentiment = "positive" | "neutral" | "negative" | "mixed";

interface Event {
  id: string;
  ts: number;
  stage: Stage;
  type: Type;
  title: string;
  summary: string;
  tags: Tag[];
  sentiment?: Sentiment;
  participants?: string[];
  responseTime?: number;
  record?: { system: string; object: string; id: string; };
  evidence?: Array<{ kind: string; text: string; }>;
  aiInsights?: string[];
  nextActions?: string[];
}

// Constants
const STAGES: Stage[] = ["prospecting", "qualification", "demo", "proposal", "negotiation", "closed"];
const STAGE_LABELS: Record<Stage, string> = {
  prospecting: "Prospecting",
  qualification: "Qualification", 
  demo: "Demo & Discovery",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed: "Closed"
};

// Demo data
const generateDemoEvents = (): Event[] => {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  
  return [
    {
      id: "e1", ts: now - 35 * DAY, stage: "prospecting", type: "linkedin",
      title: "Inbound connection from Sarah Chen (CFO)",
      summary: "Sarah accepted our connection request and viewed our company profile 3 times this week.",
      tags: ["opportunity", "champion"], sentiment: "positive", participants: ["Sarah Chen"],
      aiInsights: ["High engagement signal - profile views increased 200%", "CFO title indicates budget authority"],
      nextActions: ["Send personalized message about recent funding announcement"]
    },
    {
      id: "e2", ts: now - 34 * DAY, stage: "prospecting", type: "email",
      title: "First outreach email sent",
      summary: "Sent personalized email about Via CIM's ROI for fintech companies.",
      tags: [], sentiment: "neutral", responseTime: 0,
      evidence: [{ kind: "EMAIL_BODY", text: "Hi Sarah,\n\nI noticed GlobalFinance's impressive Q3 results..." }]
    },
    {
      id: "e3", ts: now - 32 * DAY, stage: "prospecting", type: "email",
      title: "Reply received - interested!",
      summary: "Sarah responded asking for more details about implementation timeline and pricing.",
      tags: ["opportunity"], sentiment: "positive", participants: ["Sarah Chen"], responseTime: 48,
      evidence: [{ kind: "EMAIL_BODY", text: "Hi,\n\nThis looks promising. Can you share more about typical implementation timelines?" }],
      aiInsights: ["Response time: 48hrs (good)", "Evaluating competitors - need to act fast"],
      nextActions: ["Schedule discovery call within 48 hours"]
    },
    {
      id: "e4", ts: now - 30 * DAY, stage: "qualification", type: "call",
      title: "Discovery call (45 min)",
      summary: "Detailed discussion about pain points, budget approved for Q4.",
      tags: ["opportunity", "competitor"], sentiment: "positive",
      participants: ["Sarah Chen", "Marcus Williams (VP Sales)"],
      evidence: [{ kind: "CALL_NOTES", text: "Key takeaways:\n- Budget: $150-200K approved\n- Also evaluating Salesforce and HubSpot" }],
      aiInsights: ["3-person buying committee identified", "Strong budget fit ($150-200K)"],
      nextActions: ["Send custom ROI calculator", "Schedule demo with CTO"]
    },
    {
      id: "e5", ts: now - 28 * DAY, stage: "qualification", type: "crm",
      title: "Opportunity created",
      summary: "Deal created in Salesforce: GlobalFinance - Via CIM Enterprise, $180K ARR",
      tags: [], record: { system: "Salesforce", object: "Opportunity", id: "006XX000002DiGkQAK" }
    },
    {
      id: "e6", ts: now - 25 * DAY, stage: "demo", type: "meeting",
      title: "Product demo with full buying committee",
      summary: "90-minute demo. Jamie (CTO) asked detailed technical questions.",
      tags: ["opportunity", "champion"], sentiment: "mixed",
      participants: ["Sarah Chen", "Marcus Williams", "Jamie Rodriguez (CTO)"],
      evidence: [{ kind: "MEETING_NOTES", text: "Demo went well. Jamie has concerns about:\n1. API rate limits\n2. Data residency (needs EU hosting)" }],
      aiInsights: ["Champion identified: Marcus (VP Sales)", "Blocker risk: Jamie has technical concerns"],
      nextActions: ["URGENT: Schedule technical deep-dive with Jamie", "Confirm EU hosting availability"]
    },
    {
      id: "e7", ts: now - 24 * DAY, stage: "demo", type: "email",
      title: "Follow-up email sent to Jamie",
      summary: "Addressed technical concerns, attached architecture doc.",
      tags: [], sentiment: "neutral", responseTime: 0
    },
    {
      id: "e8", ts: now - 20 * DAY, stage: "demo", type: "email",
      title: "⚠️ No response from Jamie (4 days)",
      summary: "Follow-up email sent but no response yet. Risk of deal stalling.",
      tags: ["blocker", "risk"], sentiment: "negative",
      aiInsights: ["Silence for 4 days from technical decision maker", "Deal velocity slowing"],
      nextActions: ["Escalate through Marcus or Sarah"]
    },
    {
      id: "e9", ts: now - 18 * DAY, stage: "proposal", type: "call",
      title: "Call with Marcus - competitor intel",
      summary: "Salesforce sent proposal last week. They're concerned about Via CIM's EU hosting.",
      tags: ["competitor", "blocker", "urgency"], sentiment: "negative",
      participants: ["Marcus Williams"],
      evidence: [{ kind: "CALL_NOTES", text: "Marcus: 'If you can solve the EU thing, you'll win this deal'" }],
      aiInsights: ["CRITICAL: Timeline compressed", "EU data residency is THE critical blocker"],
      nextActions: ["URGENT: Confirm EU hosting or lose deal"]
    },
    {
      id: "e10", ts: now - 17 * DAY, stage: "proposal", type: "crm",
      title: "Opportunity stage updated",
      summary: "Stage: Proposal Sent, Amount: $180K → $195K (added EU hosting)",
      tags: ["risk"], record: { system: "Salesforce", object: "Opportunity", id: "006XX000002DiGkQAK" }
    },
    {
      id: "e11", ts: now - 16 * DAY, stage: "proposal", type: "email",
      title: "✅ EU hosting confirmed",
      summary: "Product team confirmed Frankfurt data center. Sent updated proposal.",
      tags: ["opportunity"], sentiment: "positive",
      aiInsights: ["Blocker removed!", "Quick response shows urgency"],
    },
    {
      id: "e12", ts: now - 14 * DAY, stage: "negotiation", type: "meeting",
      title: "Pricing negotiation call",
      summary: "Sarah pushing for $170K, we're at $195K.",
      tags: ["urgency"], sentiment: "mixed", participants: ["Sarah Chen", "Marcus Williams"],
      aiInsights: ["Sarah has clear walkaway number: $175K"],
      nextActions: ["Get approval for $175K pricing"]
    },
    {
      id: "e13", ts: now - 12 * DAY, stage: "negotiation", type: "email",
      title: "Counter-offer sent",
      summary: "Proposed $175K with annual payment, 4 training sessions.",
      tags: ["opportunity"], sentiment: "positive", responseTime: 0
    },
    {
      id: "e14", ts: now - 10 * DAY, stage: "negotiation", type: "email",
      title: "✅ Verbal agreement!",
      summary: "Sarah accepted: $175K. Contract being reviewed by legal.",
      tags: ["opportunity", "champion"], sentiment: "positive",
      participants: ["Sarah Chen"], responseTime: 36,
      aiInsights: ["Deal verbally closed!", "Legal review is standard, low risk"],
      nextActions: ["Prep contract for legal review"]
    },
    {
      id: "e15", ts: now - 5 * DAY, stage: "closed", type: "crm",
      title: "🎉 Deal Closed Won!",
      summary: "Contract signed! GlobalFinance - $175K ARR, 3-year term.",
      tags: ["opportunity", "champion"], sentiment: "positive",
      record: { system: "Salesforce", object: "Opportunity", id: "006XX000002DiGkQAK" },
      evidence: [{ kind: "DEAL_NOTES", text: "Final deal terms:\n- ARR: $175,000\n- Term: 3 years\n- Implementation: 6 weeks" }]
    }
  ];
};

// Config
const typeConfig: Record<Type, { icon: string; label: string }> = {
  call: { icon: "📞", label: "Call" },
  email: { icon: "✉️", label: "Email" },
  meeting: { icon: "👥", label: "Meeting" },
  crm: { icon: "📊", label: "CRM" },
  linkedin: { icon: "💼", label: "LinkedIn" },
  chat: { icon: "💬", label: "Chat" }
};

const tagConfig: Record<Tag, { color: string; bgColor: string; label: string }> = {
  risk: { color: "text-red-700", bgColor: "bg-red-50 border-red-200", label: "Risk" },
  opportunity: { color: "text-green-700", bgColor: "bg-green-50 border-green-200", label: "Opportunity" },
  champion: { color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", label: "Champion" },
  competitor: { color: "text-orange-700", bgColor: "bg-orange-50 border-orange-200", label: "Competitor" },
  blocker: { color: "text-red-700", bgColor: "bg-red-50 border-red-200", label: "Blocker" },
  urgency: { color: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-200", label: "Urgent" }
};

const sentimentConfig: Record<Sentiment, { emoji: string }> = {
  positive: { emoji: "😊" },
  neutral: { emoji: "😐" },
  negative: { emoji: "😟" },
  mixed: { emoji: "🤔" }
};

// Utilities
const classNames = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ");
const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const formatDateTime = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const getDaysSince = (ts: number) => Math.floor((Date.now() - ts) / (24 * 60 * 60 * 1000));

// Components
const JourneyHeader = ({ events }: { events: Event[] }) => {
  const riskCount = events.filter(e => e.tags.includes("risk") || e.tags.includes("blocker")).length;
  const opportunityCount = events.filter(e => e.tags.includes("opportunity")).length;
  const championCount = events.filter(e => e.tags.includes("champion")).length;
  const baseScore = 75;
  const healthScore = Math.max(0, Math.min(100, baseScore - riskCount * 5 + opportunityCount * 3 + championCount * 4));
  const getHealthColor = (score: number) => score >= 80 ? "text-green-600 bg-green-50 border-green-200" : score >= 60 ? "text-yellow-600 bg-yellow-50 border-yellow-200" : "text-red-600 bg-red-50 border-red-200";
  
  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm text-gray-600 font-medium mb-1">Journey Health</div>
              <div className={classNames("inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-2xl font-bold", getHealthColor(healthScore))}>
                {healthScore}/100
              </div>
            </div>
            <div className="h-12 w-px bg-gray-200" />
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-500">Risks</div>
                <div className="text-2xl font-semibold text-red-600">{riskCount}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Opportunities</div>
                <div className="text-2xl font-semibold text-green-600">{opportunityCount}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Champions</div>
                <div className="text-2xl font-semibold text-blue-600">{championCount}</div>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Export Report
          </button>
        </div>
      </div>
    </header>
  );
};

const CommandBar = ({ value, onChange, onClear }: { value: string; onChange: (q: string) => void; onClear: () => void }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
      <div className="max-w-3xl">
        <div className={classNames("relative transition-all", isFocused && "scale-[1.01]")}>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
          <input
            type="text" value={value}
            placeholder="Search events, filter by tag:risk or stage:demo..."
            className={classNames("w-full py-3 pl-12 pr-12 text-base bg-white border rounded-lg transition-all focus:outline-none",
              isFocused ? "border-blue-500 ring-4 ring-blue-500/10 shadow-md" : "border-gray-300 shadow-sm hover:border-gray-400"
            )}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {value && (
            <button onClick={onClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">✕</button>
          )}
        </div>
      </div>
    </div>
  );
};

const TimelineLane = ({ stage, events, minDate, maxDate, onSelectEvent, selectedEventId, isExpanded, onToggleExpand }: any) => {
  const dateRange = maxDate - minDate;
  const getXPosition = (ts: number) => ((ts - minDate) / dateRange) * 100;
  const silenceThreshold = 5 * 24 * 60 * 60 * 1000;
  const silenceGaps: any[] = [];
  const sortedEvents = [...events].sort((a, b) => a.ts - b.ts);
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const gap = sortedEvents[i + 1].ts - sortedEvents[i].ts;
    if (gap > silenceThreshold) {
      silenceGaps.push({ start: sortedEvents[i].ts, end: sortedEvents[i + 1].ts, days: Math.floor(gap / (24 * 60 * 60 * 1000)) });
    }
  }
  
  return (
    <div className="mb-8 px-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-gray-900">{STAGE_LABELS[stage]}</h2>
          <span className="text-sm text-gray-500">({events.length} events)</span>
        </div>
        <button onClick={onToggleExpand} className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>
      <div className={classNames("relative bg-white rounded-xl border border-gray-200 transition-all overflow-hidden", isExpanded ? "min-h-[200px]" : "h-24")}>
        <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 h-px bg-gray-200" />
        <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-400">
          <span>{formatDate(minDate)}</span>
          <span>{formatDate(maxDate)}</span>
        </div>
        {silenceGaps.map((gap, idx) => {
          const startX = getXPosition(gap.start);
          const endX = getXPosition(gap.end);
          const width = endX - startX;
          return (
            <div key={idx} className="absolute top-0 bottom-0 bg-red-50/50 border-x border-red-200 border-dashed" style={{ left: `${startX}%`, width: `${width}%` }}>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-red-600 font-medium whitespace-nowrap">⚠️ {gap.days}d silence</div>
            </div>
          );
        })}
        {events.map((event: Event, idx: number) => {
          const xPos = getXPosition(event.ts);
          const isSelected = selectedEventId === event.id;
          const hasRisk = event.tags.includes("risk") || event.tags.includes("blocker");
          const hasOpportunity = event.tags.includes("opportunity");
          const yOffset = isExpanded ? (idx % 4) * 40 : (idx % 2) * 20;
          return (
            <div key={event.id} className="absolute" style={{ left: `${xPos}%`, top: `calc(50% - ${yOffset}px)` }}>
              <button onClick={() => onSelectEvent(event)} className={classNames("relative group transition-all duration-200", isSelected && "z-10")}>
                {(hasRisk || hasOpportunity) && (
                  <div className={classNames("absolute inset-0 -m-2 rounded-full blur-md transition-opacity",
                    hasRisk && "bg-red-400 opacity-40", hasOpportunity && "bg-green-400 opacity-40", isSelected && "opacity-70"
                  )} />
                )}
                <div className={classNames("relative w-4 h-4 rounded-full border-2 bg-white transition-all duration-200",
                  isSelected ? "border-blue-600 scale-150 shadow-lg" : "border-gray-400 scale-100 hover:scale-125 hover:border-blue-500",
                  hasRisk && !isSelected && "border-red-500", hasOpportunity && !isSelected && "border-green-500"
                )}>
                  <div className={classNames("absolute inset-0.5 rounded-full", hasRisk ? "bg-red-500" : hasOpportunity ? "bg-green-500" : "bg-gray-400")} />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-20">
                  <div className="font-medium mb-1">{event.title}</div>
                  <div className="text-xs text-gray-300">{formatDateTime(event.ts)}</div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-8 border-transparent border-t-gray-900" />
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EvidenceLocker = ({ event, onClose, onNext, onPrev, hasNext, hasPrev }: any) => {
  if (!event) return null;
  const daysSince = getDaysSince(event.ts);
  
  return (
    <>
      <div className={classNames("fixed inset-0 bg-black/20 backdrop-blur-sm z-[200] transition-opacity duration-300", event ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={onClose} />
      <div className={classNames("fixed top-0 right-0 bottom-0 w-full sm:w-[480px] bg-white shadow-2xl z-[201] transition-transform duration-300 ease-out", event ? "translate-x-0" : "translate-x-full")}>
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between p-4">
            <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
            <div className="flex items-center gap-2">
              <button onClick={onPrev} disabled={!hasPrev} className={classNames("p-2 rounded-lg transition-colors", hasPrev ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed")}>←</button>
              <button onClick={onNext} disabled={!hasNext} className={classNames("p-2 rounded-lg transition-colors", hasNext ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed")}>→</button>
              <button onClick={onClose} className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-2">✕</button>
            </div>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-73px)] p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{typeConfig[event.type].icon}</span>
              <span className="text-sm font-medium text-gray-500">{typeConfig[event.type].label}</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-500">{daysSince === 0 ? "Today" : `${daysSince}d ago`}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
            <p className="text-base text-gray-600 leading-relaxed">{event.summary}</p>
          </div>
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag: Tag) => (
                <span key={tag} className={classNames("px-3 py-1 text-sm font-medium rounded-lg border", tagConfig[tag].color, tagConfig[tag].bgColor)}>
                  {tagConfig[tag].label}
                </span>
              ))}
            </div>
          )}
          {event.sentiment && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">{sentimentConfig[event.sentiment].emoji}</span>
              <div>
                <div className="text-sm font-medium text-gray-700">Sentiment</div>
                <div className="text-sm font-medium text-gray-900">{event.sentiment.charAt(0).toUpperCase() + event.sentiment.slice(1)}</div>
              </div>
            </div>
          )}
          {event.participants && event.participants.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-semibold text-blue-900 mb-2">Participants</div>
              <div className="space-y-1">
                {event.participants.map((p: string, i: number) => (
                  <div key={i} className="text-sm text-blue-800">👤 {p}</div>
                ))}
              </div>
            </div>
          )}
          {event.responseTime !== undefined && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-sm font-semibold text-gray-900 mb-1">Response Time</div>
              <div className="text-2xl font-bold text-gray-900">{event.responseTime}<span className="text-sm font-normal text-gray-600 ml-1">hours</span></div>
              {event.responseTime > 48 && <div className="text-sm text-red-600 mt-1">⚠️ Slower than average</div>}
              {event.responseTime <= 24 && <div className="text-sm text-green-600 mt-1">✓ Fast response!</div>}
            </div>
          )}
          {event.aiInsights && event.aiInsights.length > 0 && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🤖</span>
                <div className="text-sm font-semibold text-purple-900">AI Insights</div>
              </div>
              <ul className="space-y-2">
                {event.aiInsights.map((insight: string, i: number) => (
                  <li key={i} className="text-sm text-purple-900 flex gap-2">
                    <span className="text-purple-400">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {event.nextActions && event.nextActions.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-semibold text-green-900 mb-3">Recommended Next Actions</div>
              <div className="space-y-2">
                {event.nextActions.map((action: string, i: number) => (
                  <button key={i} className="w-full text-left p-3 bg-white border border-green-300 rounded-lg text-sm text-green-900 hover:bg-green-100 transition-colors">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">→</span>
                      <span>{action}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {event.record && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">CRM Provenance</div>
              <div className="space-y-2 font-mono text-sm text-gray-700">
                <div><span className="text-gray-500">System:</span> {event.record.system}</div>
                <div><span className="text-gray-500">Object:</span> {event.record.object}</div>
                <div><span className="text-gray-500">ID:</span> {event.record.id}</div>
              </div>
            </div>
          )}
          {event.evidence && event.evidence.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-900">Evidence</div>
              {event.evidence.map((ev: any, i: number) => (
                <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">{ev.kind.replace(/_/g, " ")}</div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">{ev.text}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Main
export default function OptimizedViaCIM() {
  const [events] = useState<Event[]>(generateDemoEvents());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<Stage>>(new Set(STAGES));
  
  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events;
    const query = searchQuery.toLowerCase();
    const tagMatch = query.match(/tag:(\w+)/);
    const stageMatch = query.match(/stage:(\w+)/);
    return events.filter(event => {
      if (tagMatch && !event.tags.some(tag => tag.includes(tagMatch[1]))) return false;
      if (stageMatch && !event.stage.includes(stageMatch[1])) return false;
      const textQuery = query.replace(/tag:\w+/g, "").replace(/stage:\w+/g, "").trim();
      if (textQuery) {
        const searchableText = [event.title, event.summary, ...event.tags, event.type, event.stage, ...(event.participants || [])].join(" ").toLowerCase();
        if (!searchableText.includes(textQuery)) return false;
      }
      return true;
    });
  }, [events, searchQuery]);
  
  const dateRange = useMemo(() => {
    if (events.length === 0) return { min: Date.now(), max: Date.now() };
    const timestamps = events.map(e => e.ts);
    return { min: Math.min(...timestamps), max: Math.max(...timestamps) };
  }, [events]);
  
  const eventsByStage = useMemo(() => {
    const grouped: Record<Stage, Event[]> = { prospecting: [], qualification: [], demo: [], proposal: [], negotiation: [], closed: [] };
    filteredEvents.forEach(event => grouped[event.stage].push(event));
    return grouped;
  }, [filteredEvents]);
  
  const selectedEventIndex = useMemo(() => {
    if (!selectedEvent) return -1;
    return filteredEvents.findIndex(e => e.id === selectedEvent.id);
  }, [selectedEvent, filteredEvents]);
  
  const handleNext = () => {
    if (selectedEventIndex < filteredEvents.length - 1) setSelectedEvent(filteredEvents[selectedEventIndex + 1]);
  };
  const handlePrev = () => {
    if (selectedEventIndex > 0) setSelectedEvent(filteredEvents[selectedEventIndex - 1]);
  };
  const toggleStageExpand = (stage: Stage) => {
    setExpandedStages(prev => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage); else next.add(stage);
      return next;
    });
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedEvent) setSelectedEvent(null);
      if (selectedEvent) {
        if (e.key === "ArrowRight" && selectedEventIndex < filteredEvents.length - 1) handleNext();
        if (e.key === "ArrowLeft" && selectedEventIndex > 0) handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEvent, selectedEventIndex, filteredEvents]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <JourneyHeader events={events} />
      <main>
        <CommandBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery("")} />
        <div className="py-8">
          {STAGES.map(stage => {
            const stageEvents = eventsByStage[stage];
            if (stageEvents.length === 0) return null;
            return (
              <TimelineLane
                key={stage} stage={stage} events={stageEvents} minDate={dateRange.min} maxDate={dateRange.max}
                onSelectEvent={setSelectedEvent} selectedEventId={selectedEvent?.id || null}
                isExpanded={expandedStages.has(stage)} onToggleExpand={() => toggleStageExpand(stage)}
              />
            );
          })}
        </div>
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-lg font-medium text-gray-900 mb-2">No events found</div>
            <div className="text-gray-600">Try adjusting your search filters</div>
          </div>
        )}
      </main>
      <EvidenceLocker event={selectedEvent} onClose={() => setSelectedEvent(null)} onNext={handleNext} onPrev={handlePrev}
        hasNext={selectedEventIndex < filteredEvents.length - 1} hasPrev={selectedEventIndex > 0} />
    </div>
  );
}

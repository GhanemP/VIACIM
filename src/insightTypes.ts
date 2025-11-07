// Data types for 3-level progressive disclosure Insight system

export interface InsightBadge {
  label: string;
  value: string;
}

export interface InsightEvidence {
  tickets: number;
  projected_improvement_pct: number;
}

export interface LinkedTicket {
  id: string;
  created: string;
  sentiment: string;
  agent: string;
  resolution: string;
  duration_sec: number;
}

export interface ImpactProjection {
  kpi: string;
  delta_pct: number;
  window_days: number;
  scope: string;
}

export interface TranscriptSpan {
  ticket_id: string;
  startSec: number;
  endSec: number;
  text: string;
}

export interface AudioRecord {
  url: string;
  duration_sec: number;
}

export interface ProvenanceRecord {
  metric: string;
  source: string;
  window: string;
  query: string;
}

export interface Calculation {
  name: string;
  value: string;
  window: string;
  method: string;
}

export interface RelatedRecord {
  system: string;
  object: string;
  record_id: string;
  url: string;
}

export interface EvidenceL2 {
  spans: TranscriptSpan[];
  audio: AudioRecord;
  provenance: ProvenanceRecord[];
  calculations: Calculation[];
  related_records: RelatedRecord[];
}

// L0 - Core data (always loaded)
export interface InsightDataL0 {
  id: string;
  title: string;
  channel: string;
  timestamp: string;
  category: string;
  problem: string;
  recommendation: string;
  evidence: InsightEvidence;
  badge?: InsightBadge;
}

// L1 - Extended data (loaded on expand)
export interface InsightDataL1 extends InsightDataL0 {
  summary: string[];
  actions: string[];
  linked_tickets: LinkedTicket[];
  impact: ImpactProjection;
}

// L2 - Full evidence (lazy loaded)
export interface InsightDataL2 extends InsightDataL1 {
  evidence_l2: EvidenceL2;
}

export type InsightLevel = 'L0' | 'L1' | 'L2';

export type InsightData = InsightDataL0 | InsightDataL1 | InsightDataL2;

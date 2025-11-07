import type { JourneyStage } from './types';

export type QuickActionId = 'escalate' | 'schedule-touchpoint' | 'log-update';

export interface QuickAction {
  id: QuickActionId;
  label: string;
  icon: string;
  description: string;
}

export const QUICK_ACTIONS: ReadonlyArray<QuickAction> = [
  { id: 'escalate', label: 'Escalate', icon: '🚨', description: 'Escalate critical account' },
  { id: 'schedule-touchpoint', label: 'Schedule Touchpoint', icon: '📅', description: 'Book customer follow-up' },
  { id: 'log-update', label: 'Log Update', icon: '📝', description: 'Record latest account notes' },
];

export const JOURNEY_STAGE_ORDER: JourneyStage[] = ['Acquisition', 'Onboarding', 'Support', 'Renewal'];

export interface StageOption {
  stage: JourneyStage;
  count: number;
}

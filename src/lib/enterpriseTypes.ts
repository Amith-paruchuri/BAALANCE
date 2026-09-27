export type SectorType = 'healthcare' | 'education' | 'corporate';

export type StressRiskLevel = 'nominal' | 'moderate' | 'elevated' | 'critical';

export interface ConfounderAdjustment {
  factor: string;
  category: 'hygiene' | 'chemical' | 'demographic' | 'pharmacology';
  description: string;
  rawImpactPercent: number;
  normalizedFormula: string;
  iconName: string;
}

export interface SubUnit {
  id: string;
  name: string; // e.g. "Night Resuscitation Unit", "Section 11-B", "Americas Squad"
  code: string;
  iconKey?: string; // animated icon identifier
  memberCount: number;
  sampledCount: number;
  rawCortisolPgMg: number;
  burnoutScore: number; // 0-100 Burnout Score
  normalizedBsi?: number; // legacy alias
  riskLevel: StressRiskLevel;
  previousQuarterScore: number;
  previousQuarterBsi?: number; // legacy alias
  confoundersDetected: string[];
  primaryStressDriver: string;
}

export interface CohortGroup {
  id: string;
  name: string; // e.g. "Emergency Medicine", "Grade 11", "Enterprise Sales"
  code: string;
  iconKey?: string; // animated icon identifier
  headOfficial: string;
  subUnits: SubUnit[];
  averageBurnoutScore: number;
  averageBsi?: number; // legacy alias
  overallRisk: StressRiskLevel;
}

export interface TailoredIntervention {
  id: string;
  title: string;
  targetCohortId: string;
  targetUnitId?: string;
  targetUnitName: string;
  category: 'circadian_curfew' | 'roster_pacing' | 'workload_cap' | 'environmental';
  rationale: string;
  projectedReductionPercent: number; // e.g. 24%
  projectedBsiReductionPercent?: number; // legacy alias
  actionProtocol: string;
  status: 'recommended' | 'active' | 'simulated';
  timeToImpactDays: number;
}

export interface SamplingCycle {
  id: string;
  name: string;
  period: string;
  status: 'active' | 'completed' | 'scheduled';
  samplesCollected: number;
  complianceRatePercent: number;
  cliaLabCertified: boolean;
}

export interface Organization {
  id: string;
  name: string;
  sector: SectorType;
  subdomain: string;
  allowedDomains: string[];
  logoEmoji: string;
  location: string;
  totalMembers: number;
  totalSampled: number;
  currentCycle: SamplingCycle;
  cohorts: CohortGroup[];
  interventions: TailoredIntervention[];
  confounderProfiles?: ConfounderAdjustment[];
}

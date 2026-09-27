export type SectorType = 'healthcare' | 'education' | 'corporate';

export type StressRiskLevel = 'nominal' | 'moderate' | 'elevated' | 'critical';

export interface ConfounderAdjustment {
  factor: string;
  category: 'hygiene' | 'chemical' | 'demographic' | 'pharmacology';
  description: string;
  rawImpactPercent: number; // e.g. -15% for daily wash leaching
  normalizedFormula: string;
  iconName: string;
}

export interface SubUnit {
  id: string;
  name: string; // e.g. "Night Shift", "Section B", "Americas Squad"
  code: string;
  memberCount: number;
  sampledCount: number;
  rawCortisolPgMg: number; // unadjusted assay reading
  normalizedBsi: number; // 0-100 Biological Stress Index
  riskLevel: StressRiskLevel;
  previousQuarterBsi: number;
  confoundersDetected: string[];
  primaryStressDriver: string;
}

export interface CohortGroup {
  id: string;
  name: string; // e.g. "Emergency Medicine", "Grade 11", "Enterprise Sales"
  code: string;
  headOfficial: string; // e.g. "Dr. Aris Thorne (Chief of Emergency)"
  subUnits: SubUnit[];
  averageBsi: number;
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
  projectedBsiReductionPercent: number; // e.g. 24%
  actionProtocol: string;
  status: 'recommended' | 'active' | 'simulated';
  timeToImpactDays: number;
}

export interface SamplingCycle {
  id: string;
  name: string; // e.g. "Q3 2026 Academic Term"
  period: string; // "Jul - Sep 2026"
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
  confounderProfiles: ConfounderAdjustment[];
}

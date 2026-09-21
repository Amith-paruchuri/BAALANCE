export type Chronotype = 'morning_lark' | 'night_owl' | 'shift_biphasic';

export type StressDriver = 
  | 'evening_meetings'
  | 'cross_timezone_flights'
  | 'heavy_deadlines'
  | 'sleep_debt'
  | 'stakeholder_board_pressure'
  | 'on_call_pager_duty'
  | 'caregiver_family_strain'
  | 'financial_runway_anxiety'
  | 'high_glycemic_irregular_meals'
  | 'hospital_ward_rotations'
  | 'clinical_exams'
  | 'irregular_night_shifts';

export type SleepQuality = 'exhausted_wired' | 'middle_night_awakenings' | 'moderate' | 'fully_restored';
export type WorkBoundaryBleed = 'always_on_bed' | 'occasional_bleed' | 'strict_boundaries';
export type CaffeineHabit = 'no_coffee' | 'immediate_waking' | 'delayed_morning' | 'afternoon_excess';
export type SomaticSymptom = 'brain_fog' | 'tension_headaches' | 'heart_palpitations' | 'gi_gut_friction' | 'none';
export type TravelFrequency = 'none_domestic' | 'occasional' | 'frequent_cross_meridian' | 'constant_nomad';

export interface UserProfile {
  email: string;
  name: string;
  age?: number;
  biologicalSex?: 'male' | 'female' | 'other';
  isPregnant?: boolean;
  healthConditions?: string[];
  medications?: string[];
  role: string;
  sector: string;
  isCustomRole?: boolean;
  weeklyHours: number;
  chronotype: Chronotype;
  nightlySleepHours: number;
  sleepQuality: SleepQuality;
  workBoundaryBleed: WorkBoundaryBleed;
  travelFrequency?: TravelFrequency;
  caffeineHabit: CaffeineHabit;
  somaticSymptoms: SomaticSymptom[];
  stressDrivers: StressDriver[];
  perceivedStressRating: number; // 1-10 clinical scale
  isDemo: boolean;
  calendarIcalUrl?: string;
  haircutDate?: string;
}

export interface HairCortisolSegment {
  id: 1 | 2 | 3;
  segmentKey: 'month1' | 'month2' | 'month3';
  title: string;
  anatomicalRegion: string;
  distanceCm: string;
  timeWindow: string;
  cortisolPgPerMg: number;
  referenceBaseline: number;
  status: 'baseline' | 'acute_surge' | 'incomplete_recovery' | 'optimal';
  clinicalStatusLabel: string;
  clinicalNote: string;
}

export interface ChainOfCustody {
  specimenBarcode: string;
  collectionSite: string;
  sampleWeightMg: number;
  currentStep: 1 | 2 | 3 | 4;
  salonPartner: string;
  courierTracking: string;
  elisaExtractionDate: string;
}

export interface WeeklyTelemetry {
  weekNumber: number;
  weekLabel: string;
  month: 1 | 2 | 3;
  monthLabel: string;
  dateRange: string;
  cortisolPgPerMg: number;
  meetingHours: number;
  eveningCalls: number;
  flightShifts: number;
  deepSleepHours: number;
  restingHeartRate: number;
  hrvRmssd: number;
  isSleepDeficit: boolean;
  triggerDetails: string;
}

export interface ProtocolAction {
  id: string;
  category: 'circadian' | 'calendar' | 'audit';
  categoryLabel: string;
  title: string;
  iconType: 'sun' | 'calendar' | 'scissors' | 'shield' | 'flame';
  badge: string;
  description: string;
  actionItems: string[];
  impactMetric: string;
}

export interface GeminiSynthesisResult {
  allostaticLoadScore: number;
  allostaticCategory: string;
  strainLevel: 'Mild' | 'Moderate' | 'High' | 'Severe';
  rootCauseCulprit: string;
  hpaAxisTrajectory: string;
  circadianDesynchronySummary: string;
  protocols: ProtocolAction[];
  nextSalonAuditDate: string;
  confidenceScore: number;
  isSynthesizing?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

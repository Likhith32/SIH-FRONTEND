// /lib/types.ts

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface HealthRecord {
  householdId?: string;
  location: string;
  waterSource: string;
  sanitationAccess: string;
  Diarrhea: 0 | 1;
  Fever: 0 | 1;
  Vomiting: 0 | 1;
  AbdominalPain: 0 | 1;
  Dehydration: 0 | 1;
  riskLevel: RiskLevel;
}

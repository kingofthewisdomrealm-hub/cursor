export type StormType =
  | "hail"
  | "wind"
  | "tornado"
  | "severe_thunderstorm"
  | "hurricane";

export type TimeFilter = "24h" | "3d" | "7d" | "30d";

export type OpportunityStatus =
  | "new"
  | "researching"
  | "ready_to_canvass"
  | "currently_canvassing"
  | "completed"
  | "rejected";

export type ConfidenceLevel = "low" | "medium" | "high" | "verified";

export interface StormReport {
  id: string;
  type: StormType;
  date: string; // ISO date YYYY-MM-DD
  time: string; // HH:mm local
  city: string;
  zipCode: string;
  windSpeedMph: number | null;
  hailSizeInches: number | null;
  lat: number;
  lng: number;
  source: string;
  sourceUrl?: string;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-100
  severity: number; // 0-100
  reportCount: number;
  residentialDensity: number; // 0-100
  estimatedPropertyAge: number; // years
  description: string;
  county: string;
  createdAt: string;
}

export interface ScoredStorm extends StormReport {
  opportunityScore: number;
  scoreBreakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  severity: number;
  recency: number;
  reportVolume: number;
  residentialDensity: number;
  propertyAge: number;
  confidence: number;
}

export interface Territory {
  id: string;
  name: string;
  zipCode: string;
  city: string;
  neighborhood: string;
  lat: number;
  lng: number;
  estimatedHomes: number;
  distanceMiles: number;
  priority: number;
  stormId: string;
}

export interface SavedOpportunity {
  id: string;
  stormId: string;
  storm: ScoredStorm;
  territories: Territory[];
  status: OpportunityStatus;
  notes: string;
  routeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentActivityEntry {
  id: string;
  timestamp: string;
  type: "scan_start" | "website_checked" | "report_found" | "opportunity_created" | "error" | "scan_complete";
  message: string;
  source?: string;
  details?: string;
}

export interface ScanResult {
  scannedAt: string;
  websitesChecked: number;
  reportsFound: number;
  opportunitiesCreated: number;
  errors: number;
  storms: StormReport[];
  activity: AgentActivityEntry[];
}

export interface DataSourceMeta {
  id: string;
  name: string;
  description: string;
  category: "weather_report" | "airport" | "government_alert" | "local_news" | "sample";
  enabled: boolean;
  requiresAuth: boolean;
  notes?: string;
}

export type ClaimStatus =
  | "new_loss"
  | "inspection_scheduled"
  | "inspection_complete"
  | "estimate_received"
  | "supplementing"
  | "negotiation"
  | "settlement"
  | "closed";

export type FileCategory =
  | "carrier_estimate"
  | "contractor_estimate"
  | "pa_estimate"
  | "photo"
  | "video"
  | "engineer_report"
  | "weather_report"
  | "invoice"
  | "receipt"
  | "correspondence";

export type DamageCategory =
  | "roof"
  | "interior"
  | "exterior"
  | "water"
  | "wind"
  | "hail"
  | "fire";

export type SupplementStatus = "pending" | "approved" | "rejected";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface ClaimFile {
  id: string;
  claimId: string;
  name: string;
  category: FileCategory;
  size: number;
  uploadedAt: string;
  url?: string;
}

export interface SupplementOpportunity {
  id: string;
  claimId: string;
  lineItem: string;
  reason: string;
  category: "roofing" | "water_mitigation" | "interior" | "code" | "general";
  estimatedValue: number;
  confidence: number;
  status: SupplementStatus;
  supportingPhotoIds: string[];
  supportingDocIds: string[];
  codeReference?: string;
}

export interface DamagePhoto {
  id: string;
  claimId: string;
  name: string;
  category: DamageCategory;
  groupId?: string;
  summary?: string;
  uploadedAt: string;
}

export interface NegotiationEntry {
  id: string;
  claimId: string;
  date: string;
  type: "initial_offer" | "supplement_submitted" | "additional_payment" | "settlement";
  amount: number;
  description: string;
}

export interface WeatherEvent {
  id: string;
  type: "hail" | "wind" | "hurricane" | "tornado" | "severe";
  date: string;
  lat: number;
  lng: number;
  windSpeed?: number;
  hailSize?: number;
  description: string;
  verified: boolean;
}

export interface ClaimWeather {
  claimId: string;
  events: WeatherEvent[];
  verificationReport?: string;
}

export interface SettlementPrediction {
  claimId: string;
  likelyMin: number;
  likelyMax: number;
  expectedApprovalPct: number;
  potentialFinalValue: number;
  confidence: number;
}

export interface Claim {
  id: string;
  homeowner: {
    name: string;
    phone: string;
    email: string;
  };
  propertyAddress: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  carrier: string;
  claimNumber: string;
  dateOfLoss: string;
  currentValue: number;
  potentialSupplementValue: number;
  status: ClaimStatus;
  assignedTo: TeamMember;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplementPackage {
  claimId: string;
  generatedAt: string;
  coverLetter: string;
  scopeSummary: string;
  missingItems: SupplementOpportunity[];
  documentList: string[];
  photoReferences: string[];
  codeReferences: string[];
  contractorNotes: string;
}

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  new_loss: "New Loss",
  inspection_scheduled: "Inspection Scheduled",
  inspection_complete: "Inspection Complete",
  estimate_received: "Estimate Received",
  supplementing: "Supplementing",
  negotiation: "Negotiation",
  settlement: "Settlement",
  closed: "Closed",
};

export const CLAIM_STATUS_ORDER: ClaimStatus[] = [
  "new_loss",
  "inspection_scheduled",
  "inspection_complete",
  "estimate_received",
  "supplementing",
  "negotiation",
  "settlement",
  "closed",
];

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  carrier_estimate: "Carrier Estimate",
  contractor_estimate: "Contractor Estimate",
  pa_estimate: "PA Estimate",
  photo: "Photos",
  video: "Videos",
  engineer_report: "Engineer Report",
  weather_report: "Weather Report",
  invoice: "Invoices",
  receipt: "Receipts",
  correspondence: "Correspondence",
};

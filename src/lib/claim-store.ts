"use client";

import type {
  Claim,
  ClaimFile,
  SupplementOpportunity,
  DamagePhoto,
  NegotiationEntry,
  SupplementStatus,
  ClaimStatus,
  FileCategory,
  DamageCategory,
  TeamMember,
} from "@/types/claim";
import { TEAM_MEMBERS } from "@/lib/seed-data";

const STORAGE_KEY = "claimpilot-data-v2";
const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4MB per file for localStorage

export const DATA_CHANGE_EVENT = "claimpilot-data-change";

interface ClaimPilotData {
  claims: Claim[];
  files: ClaimFile[];
  supplements: SupplementOpportunity[];
  damagePhotos: DamagePhoto[];
  negotiations: NegotiationEntry[];
}

function emptyData(): ClaimPilotData {
  return {
    claims: [],
    files: [],
    supplements: [],
    damagePhotos: [],
    negotiations: [],
  };
}

function loadData(): ClaimPilotData {
  if (typeof window === "undefined") return emptyData();

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const data = emptyData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  try {
    return JSON.parse(raw) as ClaimPilotData;
  } catch {
    return emptyData();
  }
}

function saveData(data: ClaimPilotData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(DATA_CHANGE_EVENT));
}

export function notifyDataChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DATA_CHANGE_EVENT));
  }
}

export function getTeamMembers(): TeamMember[] {
  return TEAM_MEMBERS;
}

export function generateClaimNumber(): string {
  const year = new Date().getFullYear();
  const seq = Date.now().toString(36).toUpperCase().slice(-6);
  return `CP-${year}-${seq}`;
}

export interface CreateClaimInput {
  homeownerName: string;
  homeownerPhone: string;
  homeownerEmail: string;
  propertyAddress: string;
  city: string;
  state: string;
  zip: string;
  carrier: string;
  claimNumber?: string;
  dateOfLoss: string;
  currentValue?: number;
  notes?: string;
  assignedToId?: string;
  status?: ClaimStatus;
}

export function createClaim(input: CreateClaimInput): Claim {
  const data = loadData();
  const assignedTo =
    TEAM_MEMBERS.find((m) => m.id === input.assignedToId) || TEAM_MEMBERS[0];
  const now = new Date().toISOString();

  const claim: Claim = {
    id: `clm-${Date.now()}`,
    homeowner: {
      name: input.homeownerName.trim(),
      phone: input.homeownerPhone.trim(),
      email: input.homeownerEmail.trim(),
    },
    propertyAddress: input.propertyAddress.trim(),
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    zip: input.zip.trim(),
    lat: 0,
    lng: 0,
    carrier: input.carrier.trim(),
    claimNumber: input.claimNumber?.trim() || generateClaimNumber(),
    dateOfLoss: input.dateOfLoss,
    currentValue: input.currentValue ?? 0,
    potentialSupplementValue: 0,
    status: input.status ?? "new_loss",
    assignedTo,
    notes: input.notes?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };

  data.claims.unshift(claim);
  saveData(data);
  return claim;
}

export interface UpdateClaimInput {
  homeownerName?: string;
  homeownerPhone?: string;
  homeownerEmail?: string;
  propertyAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  carrier?: string;
  claimNumber?: string;
  dateOfLoss?: string;
  currentValue?: number;
  potentialSupplementValue?: number;
  notes?: string;
  assignedToId?: string;
  status?: ClaimStatus;
}

export function updateClaim(id: string, input: UpdateClaimInput): Claim | undefined {
  const data = loadData();
  const claim = data.claims.find((c) => c.id === id);
  if (!claim) return undefined;

  if (input.homeownerName !== undefined) claim.homeowner.name = input.homeownerName.trim();
  if (input.homeownerPhone !== undefined) claim.homeowner.phone = input.homeownerPhone.trim();
  if (input.homeownerEmail !== undefined) claim.homeowner.email = input.homeownerEmail.trim();
  if (input.propertyAddress !== undefined) claim.propertyAddress = input.propertyAddress.trim();
  if (input.city !== undefined) claim.city = input.city.trim();
  if (input.state !== undefined) claim.state = input.state.trim().toUpperCase();
  if (input.zip !== undefined) claim.zip = input.zip.trim();
  if (input.carrier !== undefined) claim.carrier = input.carrier.trim();
  if (input.claimNumber !== undefined) claim.claimNumber = input.claimNumber.trim();
  if (input.dateOfLoss !== undefined) claim.dateOfLoss = input.dateOfLoss;
  if (input.currentValue !== undefined) claim.currentValue = input.currentValue;
  if (input.potentialSupplementValue !== undefined) {
    claim.potentialSupplementValue = input.potentialSupplementValue;
  }
  if (input.notes !== undefined) claim.notes = input.notes.trim();
  if (input.status !== undefined) claim.status = input.status;
  if (input.assignedToId !== undefined) {
    const member = TEAM_MEMBERS.find((m) => m.id === input.assignedToId);
    if (member) claim.assignedTo = member;
  }

  claim.updatedAt = new Date().toISOString();
  saveData(data);
  return claim;
}

export function deleteClaim(id: string): void {
  const data = loadData();
  data.claims = data.claims.filter((c) => c.id !== id);
  data.files = data.files.filter((f) => f.claimId !== id);
  data.supplements = data.supplements.filter((s) => s.claimId !== id);
  data.damagePhotos = data.damagePhotos.filter((p) => p.claimId !== id);
  data.negotiations = data.negotiations.filter((n) => n.claimId !== id);
  saveData(data);
}

export function getClaims(): Claim[] {
  return loadData().claims.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getClaim(id: string): Claim | undefined {
  return loadData().claims.find((c) => c.id === id);
}

export function updateClaimStatus(id: string, status: ClaimStatus): void {
  updateClaim(id, { status });
}

export function getClaimFiles(claimId: string): ClaimFile[] {
  return loadData().files.filter((f) => f.claimId === claimId);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function addClaimFileFromUpload(
  claimId: string,
  file: File,
  category: FileCategory
): Promise<{ file?: ClaimFile; error?: string }> {
  if (file.size > MAX_FILE_BYTES) {
    return {
      error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 4 MB per file.`,
    };
  }

  const dataUrl = await readFileAsDataUrl(file);
  const data = loadData();

  const claimFile: ClaimFile = {
    id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    claimId,
    name: file.name,
    category,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    url: dataUrl,
  };

  data.files.push(claimFile);

  if (category === "photo") {
    const damagePhoto: DamagePhoto = {
      id: `dp-${Date.now()}`,
      claimId,
      name: file.name,
      category: "exterior" as DamageCategory,
      uploadedAt: claimFile.uploadedAt,
    };
    data.damagePhotos.push(damagePhoto);
  }

  const claim = data.claims.find((c) => c.id === claimId);
  if (claim) claim.updatedAt = new Date().toISOString();

  saveData(data);
  return { file: claimFile };
}

export function deleteClaimFile(fileId: string): void {
  const data = loadData();
  data.files = data.files.filter((f) => f.id !== fileId);
  saveData(data);
}

export function getSupplements(claimId: string): SupplementOpportunity[] {
  return loadData().supplements.filter((s) => s.claimId === claimId);
}

export function updateSupplementStatus(id: string, status: SupplementStatus): void {
  const data = loadData();
  const sup = data.supplements.find((s) => s.id === id);
  if (!sup) return;

  sup.status = status;

  const claim = data.claims.find((c) => c.id === sup.claimId);
  if (claim) {
    const claimSupps = data.supplements.filter((s) => s.claimId === sup.claimId);
    const pendingTotal = claimSupps
      .filter((s) => s.status === "pending" || s.status === "approved")
      .reduce((sum, s) => sum + s.estimatedValue, 0);
    claim.potentialSupplementValue = pendingTotal;
    claim.updatedAt = new Date().toISOString();
  }

  saveData(data);
}

export function setSupplements(
  claimId: string,
  supplements: SupplementOpportunity[]
): void {
  const data = loadData();
  data.supplements = data.supplements.filter((s) => s.claimId !== claimId);
  data.supplements.push(...supplements);

  const claim = data.claims.find((c) => c.id === claimId);
  if (claim) {
    claim.potentialSupplementValue = supplements.reduce(
      (sum, s) => sum + s.estimatedValue,
      0
    );
    claim.updatedAt = new Date().toISOString();
  }

  saveData(data);
}

export function getDamagePhotos(claimId: string): DamagePhoto[] {
  return loadData().damagePhotos.filter((p) => p.claimId === claimId);
}

export function getNegotiations(claimId: string): NegotiationEntry[] {
  return loadData().negotiations.filter((n) => n.claimId === claimId);
}

export function addNegotiationEntry(
  claimId: string,
  entry: Omit<NegotiationEntry, "id" | "claimId">
): NegotiationEntry {
  const data = loadData();
  const neg: NegotiationEntry = {
    id: `neg-${Date.now()}`,
    claimId,
    ...entry,
  };
  data.negotiations.push(neg);

  const claim = data.claims.find((c) => c.id === claimId);
  if (claim) {
    if (entry.type === "initial_offer" || entry.type === "additional_payment" || entry.type === "settlement") {
      const payments = data.negotiations
        .filter(
          (n) =>
            n.claimId === claimId &&
            (n.type === "initial_offer" || n.type === "additional_payment" || n.type === "settlement")
        )
        .reduce((sum, n) => sum + n.amount, 0);
      claim.currentValue = payments;
    }
    claim.updatedAt = new Date().toISOString();
  }

  saveData(data);
  return neg;
}

export function searchClaims(query: string): Claim[] {
  const q = query.toLowerCase();
  return getClaims().filter(
    (c) =>
      c.homeowner.name.toLowerCase().includes(q) ||
      c.propertyAddress.toLowerCase().includes(q) ||
      c.claimNumber.toLowerCase().includes(q) ||
      c.carrier.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
  );
}

export function recalculateSupplementTotal(claimId: string): void {
  const data = loadData();
  const claim = data.claims.find((c) => c.id === claimId);
  if (!claim) return;

  const total = data.supplements
    .filter((s) => s.claimId === claimId && s.status !== "rejected")
    .reduce((sum, s) => sum + s.estimatedValue, 0);

  claim.potentialSupplementValue = total;
  saveData(data);
}

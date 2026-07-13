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
} from "@/types/claim";
import {
  SEED_CLAIMS,
  SEED_FILES,
  SEED_SUPPLEMENTS,
  SEED_DAMAGE_PHOTOS,
  SEED_NEGOTIATIONS,
} from "@/lib/seed-data";

const STORAGE_KEY = "claimpilot-data";

interface ClaimPilotData {
  claims: Claim[];
  files: ClaimFile[];
  supplements: SupplementOpportunity[];
  damagePhotos: DamagePhoto[];
  negotiations: NegotiationEntry[];
  initialized: boolean;
}

function loadData(): ClaimPilotData {
  if (typeof window === "undefined") {
    return {
      claims: SEED_CLAIMS,
      files: SEED_FILES,
      supplements: SEED_SUPPLEMENTS,
      damagePhotos: SEED_DAMAGE_PHOTOS,
      negotiations: SEED_NEGOTIATIONS,
      initialized: true,
    };
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const data: ClaimPilotData = {
      claims: SEED_CLAIMS,
      files: SEED_FILES,
      supplements: SEED_SUPPLEMENTS,
      damagePhotos: SEED_DAMAGE_PHOTOS,
      negotiations: SEED_NEGOTIATIONS,
      initialized: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  return JSON.parse(raw) as ClaimPilotData;
}

function saveData(data: ClaimPilotData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getClaims(): Claim[] {
  return loadData().claims;
}

export function getClaim(id: string): Claim | undefined {
  return loadData().claims.find((c) => c.id === id);
}

export function updateClaimStatus(id: string, status: ClaimStatus): void {
  const data = loadData();
  const claim = data.claims.find((c) => c.id === id);
  if (claim) {
    claim.status = status;
    claim.updatedAt = new Date().toISOString();
    saveData(data);
  }
}

export function getClaimFiles(claimId: string): ClaimFile[] {
  return loadData().files.filter((f) => f.claimId === claimId);
}

export function addClaimFile(
  claimId: string,
  name: string,
  category: FileCategory,
  size: number
): ClaimFile {
  const data = loadData();
  const file: ClaimFile = {
    id: `f-${Date.now()}`,
    claimId,
    name,
    category,
    size,
    uploadedAt: new Date().toISOString(),
  };
  data.files.push(file);
  saveData(data);
  return file;
}

export function getSupplements(claimId: string): SupplementOpportunity[] {
  return loadData().supplements.filter((s) => s.claimId === claimId);
}

export function updateSupplementStatus(
  id: string,
  status: SupplementStatus
): void {
  const data = loadData();
  const sup = data.supplements.find((s) => s.id === id);
  if (sup) {
    sup.status = status;
    saveData(data);
  }
}

export function setSupplements(
  claimId: string,
  supplements: SupplementOpportunity[]
): void {
  const data = loadData();
  data.supplements = data.supplements.filter((s) => s.claimId !== claimId);
  data.supplements.push(...supplements);
  saveData(data);
}

export function getDamagePhotos(claimId: string): DamagePhoto[] {
  return loadData().damagePhotos.filter((p) => p.claimId === claimId);
}

export function getNegotiations(claimId: string): NegotiationEntry[] {
  return loadData().negotiations.filter((n) => n.claimId === claimId);
}

export function getAllSupplements(): SupplementOpportunity[] {
  return loadData().supplements;
}

export function searchClaims(query: string): Claim[] {
  const q = query.toLowerCase();
  return loadData().claims.filter(
    (c) =>
      c.homeowner.name.toLowerCase().includes(q) ||
      c.propertyAddress.toLowerCase().includes(q) ||
      c.claimNumber.toLowerCase().includes(q) ||
      c.carrier.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
  );
}

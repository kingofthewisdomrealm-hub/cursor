import type { SupplementOpportunity } from "@/types/claim";

const ROOFING_ITEMS = [
  { item: "Starter Strip", reason: "Commonly missed roofing item. Required for proper shingle installation per manufacturer specs.", category: "roofing" as const, value: 980, confidence: 88 },
  { item: "Drip Edge", reason: "IRC R905.2.8.5 requires drip edge on all eaves and rakes. Not included in carrier estimate.", category: "code" as const, value: 1850, confidence: 94, code: "IRC R905.2.8.5" },
  { item: "Ice & Water Barrier", reason: "Required at eaves per local building code. Carrier scope shows felt underlayment only.", category: "code" as const, value: 3200, confidence: 91, code: "IRC R905.1.2" },
  { item: "Valley Metal", reason: "Open valley metal treatment required. Missing from carrier line items.", category: "roofing" as const, value: 2400, confidence: 86 },
  { item: "Step Flashing", reason: "Step flashing at wall intersections damaged and must be replaced.", category: "roofing" as const, value: 1950, confidence: 85 },
  { item: "Ridge Vent Replacement", reason: "Damaged ridge vent visible in inspection photos. Not scoped by carrier.", category: "roofing" as const, value: 1650, confidence: 82 },
  { item: "Pipe Boot Replacement", reason: "Cracked pipe boots identified during inspection. Common leak point.", category: "roofing" as const, value: 450, confidence: 80 },
];

const WATER_MITIGATION_ITEMS = [
  { item: "Insulation Replacement", reason: "Wet insulation must be replaced per IICRC S500 standards.", category: "water_mitigation" as const, value: 2800, confidence: 87 },
  { item: "Anti-Microbial Treatment", reason: "Required treatment for affected areas to prevent mold growth.", category: "water_mitigation" as const, value: 1200, confidence: 83 },
  { item: "Equipment Rental (Dehumidifiers)", reason: "Extended drying period requires additional dehumidification equipment.", category: "water_mitigation" as const, value: 1800, confidence: 79 },
  { item: "Content Manipulation", reason: "Furniture and contents moved for access during mitigation.", category: "water_mitigation" as const, value: 950, confidence: 76 },
];

const INTERIOR_ITEMS = [
  { item: "Drywall Replacement", reason: "Water-damaged drywall cannot be dried in place. Full replacement required.", category: "interior" as const, value: 4200, confidence: 89 },
  { item: "Texture Matching", reason: "Ceiling/wall texture cannot be matched without full section replacement.", category: "interior" as const, value: 1600, confidence: 78 },
  { item: "Paint Matching (Full Elevation)", reason: "Repairs require full elevation paint for uniform appearance.", category: "interior" as const, value: 3800, confidence: 72 },
  { item: "Baseboard Replacement", reason: "Water-damaged baseboards must be removed and replaced.", category: "interior" as const, value: 850, confidence: 81 },
];

const GENERAL_ITEMS = [
  { item: "Permit Fees", reason: "Local jurisdiction requires permit for structural repairs.", category: "general" as const, value: 450, confidence: 95 },
  { item: "Dumpster / Debris Removal", reason: "Carrier estimate lacks debris removal for tear-off and demolition.", category: "general" as const, value: 850, confidence: 90 },
  { item: "Detach & Reset Items", reason: "HVAC unit, satellite dish, and solar mounts require detach/reset.", category: "general" as const, value: 1200, confidence: 84 },
  { item: "Code Upgrade - Electrical", reason: "Code requires GFCI outlets in affected wet areas.", category: "code" as const, value: 650, confidence: 88, code: "NEC 210.8" },
];

interface AnalyzeInput {
  claimId: string;
  hasCarrierEstimate: boolean;
  hasContractorEstimate: boolean;
  hasPhotos: boolean;
  notes: string;
}

export function analyzeSupplementsDemo(input: AnalyzeInput): SupplementOpportunity[] {
  const items = [...ROOFING_ITEMS, ...WATER_MITIGATION_ITEMS, ...INTERIOR_ITEMS, ...GENERAL_ITEMS];
  const noteText = input.notes.toLowerCase();

  let selected = items;
  if (noteText.includes("hail") || noteText.includes("roof")) {
    selected = [...ROOFING_ITEMS, ...GENERAL_ITEMS];
  }
  if (noteText.includes("water") || noteText.includes("interior")) {
    selected = [...selected, ...WATER_MITIGATION_ITEMS, ...INTERIOR_ITEMS];
  }

  const count = input.hasCarrierEstimate && input.hasContractorEstimate ? 6 : 4;
  const shuffled = selected.sort(() => Math.random() - 0.5).slice(0, count);

  return shuffled.map((item, i) => ({
    id: `sup-ai-${Date.now()}-${i}`,
    claimId: input.claimId,
    lineItem: item.item,
    reason: item.reason,
    category: item.category,
    estimatedValue: item.value + Math.floor(Math.random() * 200),
    confidence: item.confidence + Math.floor(Math.random() * 5) - 2,
    status: "pending" as const,
    supportingPhotoIds: input.hasPhotos ? [] : [],
    supportingDocIds: [],
    codeReference: "code" in item ? item.code : undefined,
  }));
}

export function buildSupplementPackage(
  claimId: string,
  claim: { homeowner: { name: string }; propertyAddress: string; city: string; state: string; zip: string; carrier: string; claimNumber: string; dateOfLoss: string },
  supplements: SupplementOpportunity[]
) {
  const approved = supplements.filter((s) => s.status === "approved");
  const pending = supplements.filter((s) => s.status === "pending");
  const allItems = [...approved, ...pending];
  const totalValue = allItems.reduce((sum, s) => sum + s.estimatedValue, 0);

  return {
    claimId,
    generatedAt: new Date().toISOString(),
    coverLetter: `Dear ${claim.carrier} Claims Department,

RE: Claim Number ${claim.claimNumber}
    Insured: ${claim.homeowner.name}
    Property: ${claim.propertyAddress}, ${claim.city}, ${claim.state} ${claim.zip}
    Date of Loss: ${claim.dateOfLoss}

We are submitting this supplement package on behalf of our client requesting additional scope items identified during our comprehensive review of the carrier estimate, contractor estimate, field inspection documentation, and applicable building codes.

After thorough analysis, we have identified ${allItems.length} line items totaling ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalValue)} in additional scope that were omitted or under-scoped in the original carrier estimate.

Each item listed herein is supported by photographic evidence, contractor documentation, and/or applicable building code requirements. We respectfully request your review and approval of these supplemental items.

Please contact our office if you require any additional documentation or wish to schedule a re-inspection.

Respectfully submitted,
ClaimPilot AI Supplement Team`,
    scopeSummary: `Property sustained damage on ${claim.dateOfLoss}. Initial carrier estimate did not fully account for code-required materials, commonly missed roofing components, and interior restoration items identified during field inspection and contractor review.\n\nTotal supplement request: ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalValue)} across ${allItems.length} line items.`,
    missingItems: allItems,
    documentList: allItems.flatMap((s) => s.supportingDocIds).filter(Boolean),
    photoReferences: allItems.flatMap((s) => s.supportingPhotoIds).filter(Boolean),
    codeReferences: allItems.filter((s) => s.codeReference).map((s) => `${s.lineItem}: ${s.codeReference}`),
    contractorNotes: "Contractor estimate reflects current market pricing and includes all materials required for code-compliant restoration. Detach and reset of roof-mounted equipment included per industry standard.",
  };
}

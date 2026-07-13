"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createClaim,
  updateClaim,
  generateClaimNumber,
  getTeamMembers,
  type CreateClaimInput,
  type UpdateClaimInput,
} from "@/lib/claim-store";
import type { Claim, ClaimStatus } from "@/types/claim";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_ORDER } from "@/types/claim";

const CARRIERS = [
  "State Farm",
  "Allstate",
  "USAA",
  "Farmers",
  "Liberty Mutual",
  "Travelers",
  "Nationwide",
  "Progressive",
  "GEICO",
  "Hartford",
  "Other",
];

export interface ClaimFormValues {
  homeownerName: string;
  homeownerPhone: string;
  homeownerEmail: string;
  propertyAddress: string;
  city: string;
  state: string;
  zip: string;
  carrier: string;
  carrierOther: string;
  claimNumber: string;
  dateOfLoss: string;
  currentValue: string;
  notes: string;
  assignedToId: string;
  status: ClaimStatus;
}

function claimToForm(claim?: Claim): ClaimFormValues {
  const isKnownCarrier = claim ? CARRIERS.slice(0, -1).includes(claim.carrier) : true;
  return {
    homeownerName: claim?.homeowner.name ?? "",
    homeownerPhone: claim?.homeowner.phone ?? "",
    homeownerEmail: claim?.homeowner.email ?? "",
    propertyAddress: claim?.propertyAddress ?? "",
    city: claim?.city ?? "",
    state: claim?.state ?? "",
    zip: claim?.zip ?? "",
    carrier: claim ? (isKnownCarrier ? claim.carrier : "Other") : "",
    carrierOther: claim && !isKnownCarrier ? claim.carrier : "",
    claimNumber: claim?.claimNumber ?? generateClaimNumber(),
    dateOfLoss: claim?.dateOfLoss ?? new Date().toISOString().split("T")[0],
    currentValue: claim?.currentValue ? String(claim.currentValue) : "",
    notes: claim?.notes ?? "",
    assignedToId: claim?.assignedTo.id ?? getTeamMembers()[0].id,
    status: claim?.status ?? "new_loss",
  };
}

function formToInput(values: ClaimFormValues): CreateClaimInput & UpdateClaimInput {
  const carrier =
    values.carrier === "Other" ? values.carrierOther.trim() : values.carrier.trim();
  return {
    homeownerName: values.homeownerName,
    homeownerPhone: values.homeownerPhone,
    homeownerEmail: values.homeownerEmail,
    propertyAddress: values.propertyAddress,
    city: values.city,
    state: values.state,
    zip: values.zip,
    carrier,
    claimNumber: values.claimNumber,
    dateOfLoss: values.dateOfLoss,
    currentValue: values.currentValue ? parseFloat(values.currentValue.replace(/,/g, "")) : 0,
    notes: values.notes,
    assignedToId: values.assignedToId,
    status: values.status,
  };
}

interface Props {
  mode: "create" | "edit";
  claim?: Claim;
  onCancel?: () => void;
}

export function ClaimForm({ mode, claim, onCancel }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<ClaimFormValues>(() => claimToForm(claim));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (field: keyof ClaimFormValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!values.homeownerName.trim()) next.homeownerName = "Homeowner name is required";
    if (!values.propertyAddress.trim()) next.propertyAddress = "Property address is required";
    if (!values.city.trim()) next.city = "City is required";
    if (!values.state.trim()) next.state = "State is required";
    if (!values.zip.trim()) next.zip = "ZIP is required";
    if (!values.carrier) next.carrier = "Carrier is required";
    if (values.carrier === "Other" && !values.carrierOther.trim()) {
      next.carrierOther = "Enter carrier name";
    }
    if (!values.dateOfLoss) next.dateOfLoss = "Date of loss is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const input = formToInput(values);
      if (mode === "create") {
        const created = createClaim(input);
        router.push(`/claims/${created.id}`);
      } else if (claim) {
        updateClaim(claim.id, input);
        router.push(`/claims/${claim.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-700/80 bg-zinc-950/60 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base";
  const labelClass = "block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2";
  const errorClass = "mt-1 text-xs text-red-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-sm font-bold text-white mb-5">Homeowner</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Name *</label>
            <input
              className={inputClass}
              value={values.homeownerName}
              onChange={(e) => set("homeownerName", e.target.value)}
              placeholder="John & Jane Smith"
              autoFocus
            />
            {errors.homeownerName && <p className={errorClass}>{errors.homeownerName}</p>}
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              type="tel"
              value={values.homeownerPhone}
              onChange={(e) => set("homeownerPhone", e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              className={inputClass}
              type="email"
              value={values.homeownerEmail}
              onChange={(e) => set("homeownerEmail", e.target.value)}
              placeholder="homeowner@email.com"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-sm font-bold text-white mb-5">Property</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Street Address *</label>
            <input
              className={inputClass}
              value={values.propertyAddress}
              onChange={(e) => set("propertyAddress", e.target.value)}
              placeholder="123 Main Street"
            />
            {errors.propertyAddress && <p className={errorClass}>{errors.propertyAddress}</p>}
          </div>
          <div>
            <label className={labelClass}>City *</label>
            <input
              className={inputClass}
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
            />
            {errors.city && <p className={errorClass}>{errors.city}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>State *</label>
              <input
                className={inputClass}
                value={values.state}
                onChange={(e) => set("state", e.target.value.toUpperCase())}
                placeholder="TX"
                maxLength={2}
              />
              {errors.state && <p className={errorClass}>{errors.state}</p>}
            </div>
            <div>
              <label className={labelClass}>ZIP *</label>
              <input
                className={inputClass}
                value={values.zip}
                onChange={(e) => set("zip", e.target.value)}
                placeholder="75001"
              />
              {errors.zip && <p className={errorClass}>{errors.zip}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-sm font-bold text-white mb-5">Claim Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Carrier *</label>
            <select
              className={inputClass}
              value={values.carrier}
              onChange={(e) => set("carrier", e.target.value)}
            >
              <option value="">Select carrier...</option>
              {CARRIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.carrier && <p className={errorClass}>{errors.carrier}</p>}
          </div>
          {values.carrier === "Other" && (
            <div>
              <label className={labelClass}>Carrier Name *</label>
              <input
                className={inputClass}
                value={values.carrierOther}
                onChange={(e) => set("carrierOther", e.target.value)}
              />
              {errors.carrierOther && <p className={errorClass}>{errors.carrierOther}</p>}
            </div>
          )}
          <div>
            <label className={labelClass}>Claim Number</label>
            <input
              className={inputClass}
              value={values.claimNumber}
              onChange={(e) => set("claimNumber", e.target.value)}
            />
            <p className="mt-1 text-[10px] text-zinc-600">Auto-generated if left as-is for new claims</p>
          </div>
          <div>
            <label className={labelClass}>Date of Loss *</label>
            <input
              className={inputClass}
              type="date"
              value={values.dateOfLoss}
              onChange={(e) => set("dateOfLoss", e.target.value)}
            />
            {errors.dateOfLoss && <p className={errorClass}>{errors.dateOfLoss}</p>}
          </div>
          <div>
            <label className={labelClass}>Current Claim Value ($)</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="1"
              value={values.currentValue}
              onChange={(e) => set("currentValue", e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>Pipeline Status</label>
            <select
              className={inputClass}
              value={values.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {CLAIM_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {CLAIM_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Assigned To</label>
            <select
              className={inputClass}
              value={values.assignedToId}
              onChange={(e) => set("assignedToId", e.target.value)}
            >
              {getTeamMembers().map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.role}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Loss Notes</label>
            <textarea
              className={`${inputClass} resize-y min-h-[120px]`}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Describe the loss: hail damage to roof, water intrusion, fire, etc."
              rows={4}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pb-8">
        <button
          type="button"
          onClick={onCancel ?? (() => router.back())}
          className="rounded-xl border border-zinc-700 px-6 py-3.5 text-sm font-bold text-zinc-300 hover:bg-zinc-800/50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Claim" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

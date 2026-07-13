"use client";

import type { ClaimFile } from "@/types/claim";
import { formatDate } from "@/lib/utils";
import { Camera, AlertTriangle } from "lucide-react";

interface Props {
  photoFiles: ClaimFile[];
  suggestions?: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  roof: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  interior: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  exterior: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  water: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  wind: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  hail: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  fire: "bg-red-500/20 text-red-300 border-red-500/30",
  photo: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

export function DamageAnalysis({ photoFiles, suggestions }: Props) {
  return (
    <div className="space-y-6">
      {suggestions && suggestions.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
            <AlertTriangle className="h-4 w-4" />
            Suggested Additional Documentation
          </h3>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {photoFiles.length > 0 ? (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
            Damage Photos ({photoFiles.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {photoFiles.map((file) => (
              <div
                key={file.id}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden"
              >
                <div className="aspect-video bg-zinc-800/60 flex items-center justify-center overflow-hidden">
                  {file.url ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="h-10 w-10 text-zinc-600" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <p className="text-sm font-medium text-zinc-200 truncate">{file.name}</p>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${CATEGORY_COLORS.photo}`}
                    >
                      photo
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-600">{formatDate(file.uploadedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500">
          <Camera className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm mb-2">No damage photos yet.</p>
          <p className="text-xs text-zinc-600">
            Upload photos in the Files tab, then return here to analyze.
          </p>
        </div>
      )}
    </div>
  );
}

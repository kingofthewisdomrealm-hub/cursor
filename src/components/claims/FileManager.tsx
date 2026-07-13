"use client";

import type { ClaimFile, FileCategory } from "@/types/claim";
import { FILE_CATEGORY_LABELS } from "@/types/claim";
import { formatFileSize, formatDate } from "@/lib/utils";
import {
  FileText,
  Image,
  Video,
  FileCheck,
  CloudRain,
  Receipt,
  Mail,
  Upload,
  Calculator,
} from "lucide-react";

const CATEGORY_ICONS: Record<FileCategory, typeof FileText> = {
  carrier_estimate: Calculator,
  contractor_estimate: Calculator,
  pa_estimate: Calculator,
  photo: Image,
  video: Video,
  engineer_report: FileCheck,
  weather_report: CloudRain,
  invoice: Receipt,
  receipt: Receipt,
  correspondence: Mail,
};

interface Props {
  files: ClaimFile[];
  onUpload: (category: FileCategory, fileName: string) => void;
}

const UPLOAD_CATEGORIES: FileCategory[] = [
  "carrier_estimate",
  "contractor_estimate",
  "pa_estimate",
  "photo",
  "video",
  "engineer_report",
  "weather_report",
  "invoice",
  "receipt",
  "correspondence",
];

export function FileManager({ files, onUpload }: Props) {
  const handleFileSelect = (category: FileCategory) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = category === "photo" ? "image/*" : category === "video" ? "video/*" : "*/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onUpload(category, file.name);
    };
    input.click();
  };

  const grouped = UPLOAD_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = files.filter((f) => f.category === cat);
      return acc;
    },
    {} as Record<FileCategory, ClaimFile[]>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {UPLOAD_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <button
              key={cat}
              onClick={() => handleFileSelect(cat)}
              className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-700 hover:border-blue-500/50 hover:bg-blue-500/5 p-3 sm:p-4 transition-all group"
            >
              <Icon className="h-5 w-5 text-zinc-500 group-hover:text-blue-400" />
              <span className="text-[10px] sm:text-xs font-medium text-zinc-400 group-hover:text-blue-300 text-center leading-tight">
                {FILE_CATEGORY_LABELS[cat]}
              </span>
              <Upload className="h-3 w-3 text-zinc-600 group-hover:text-blue-400" />
            </button>
          );
        })}
      </div>

      {UPLOAD_CATEGORIES.map((cat) => {
        const catFiles = grouped[cat];
        if (catFiles.length === 0) return null;
        const Icon = CATEGORY_ICONS[cat];

        return (
          <div key={cat}>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
              <Icon className="h-4 w-4" />
              {FILE_CATEGORY_LABELS[cat]} ({catFiles.length})
            </h3>
            <div className="space-y-2">
              {catFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3"
                >
                  <Icon className="h-4 w-4 text-zinc-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200 truncate">{file.name}</p>
                    <p className="text-xs text-zinc-500">
                      {formatFileSize(file.size)} &middot; {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {files.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No files uploaded yet. Use the buttons above to add documents.</p>
        </div>
      )}
    </div>
  );
}

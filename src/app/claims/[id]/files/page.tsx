"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClaimSubNav } from "@/components/claims/ClaimSubNav";
import { FileManager } from "@/components/claims/FileManager";
import {
  getClaim,
  getClaimFiles,
  addClaimFileFromUpload,
  deleteClaimFile,
  DATA_CHANGE_EVENT,
} from "@/lib/claim-store";
import type { Claim, ClaimFile, FileCategory } from "@/types/claim";
import { ArrowLeft } from "lucide-react";

export default function ClaimFilesPage() {
  const params = useParams();
  const claimId = params.id as string;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [files, setFiles] = useState<ClaimFile[]>([]);

  const refresh = useCallback(() => {
    setClaim(getClaim(claimId) || null);
    setFiles(getClaimFiles(claimId));
  }, [claimId]);

  useEffect(() => {
    refresh();
    window.addEventListener(DATA_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, refresh);
  }, [refresh]);

  const handleUpload = async (category: FileCategory, file: File) => {
    const result = await addClaimFileFromUpload(claimId, file, category);
    if (!result.error) refresh();
    return { error: result.error };
  };

  const handleDelete = (fileId: string) => {
    if (confirm("Delete this file?")) {
      deleteClaimFile(fileId);
      refresh();
    }
  };

  if (!claim) {
    return (
      <AppShell>
        <p className="text-zinc-500">Claim not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link
        href={`/claims/${claimId}`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-blue-400 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {claim.homeowner.name}
      </Link>

      <h1 className="text-2xl font-black text-white mb-1">Claim Files</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Upload estimates, photos, and documents — saved on this device (max 4 MB per file)
      </p>

      <ClaimSubNav claimId={claimId} />
      <FileManager files={files} onUpload={handleUpload} onDelete={handleDelete} />

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}

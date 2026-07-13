"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClaimSubNav } from "@/components/claims/ClaimSubNav";
import { FileManager } from "@/components/claims/FileManager";
import { getClaim, getClaimFiles, addClaimFile } from "@/lib/claim-store";
import type { Claim, ClaimFile, FileCategory } from "@/types/claim";
import { ArrowLeft } from "lucide-react";

export default function ClaimFilesPage() {
  const params = useParams();
  const claimId = params.id as string;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [files, setFiles] = useState<ClaimFile[]>([]);

  useEffect(() => {
    setClaim(getClaim(claimId) || null);
    setFiles(getClaimFiles(claimId));
  }, [claimId]);

  const handleUpload = (category: FileCategory, fileName: string) => {
    const file = addClaimFile(claimId, fileName, category, Math.floor(Math.random() * 5000000) + 50000);
    setFiles((prev) => [...prev, file]);
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
        Upload and organize all claim documentation
      </p>

      <ClaimSubNav claimId={claimId} />
      <FileManager files={files} onUpload={handleUpload} />

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}

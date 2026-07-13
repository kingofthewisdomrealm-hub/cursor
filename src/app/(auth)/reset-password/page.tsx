"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { stayStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    const result = stayStore.requestPasswordReset(email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(result.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
          StayFlow
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">
          Reset password
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          We&apos;ll email reset instructions for your account.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}
          {message ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-semibold text-teal-700 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Sparkles } from "lucide-react";
import { stayStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@stayflow.app");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = stayStore.login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 shadow-2xl backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-[#0b1f24] p-10 text-teal-50 md:block">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f24]/[0.85] via-[#0b1f24]/70 to-teal-900/50" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/20 ring-1 ring-teal-300/30">
                <Sparkles className="h-5 w-5 text-teal-200" />
              </span>
              <div>
                <p className="font-display text-2xl font-semibold text-white">StayFlow</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-teal-200/70">
                  Property OS
                </p>
              </div>
            </div>
            <div>
              <h1 className="font-display text-4xl font-semibold leading-tight text-white">
                Run every property from one calm calendar.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-teal-50/80">
                Occupancy, reservations, housekeeping signals, and revenue — designed for hotels,
                hostels, and Airbnb operators.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-8 md:hidden">
            <p className="font-display text-2xl font-semibold text-slate-900">StayFlow</p>
          </div>
          <h2 className="font-display text-2xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to your property workspace. Demo: demo@stayflow.app / demo1234
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
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
            <Link href="/reset-password" className="font-medium text-teal-700 hover:underline">
              Reset password
            </Link>
            <Link href="/signup" className="font-medium text-slate-700 hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

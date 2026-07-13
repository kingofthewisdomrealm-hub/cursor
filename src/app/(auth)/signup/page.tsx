"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { stayStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { UserRole } from "@/types";
import { ROLE_LABELS } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("owner");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const result = stayStore.signup({
      email,
      password,
      full_name: fullName,
      role,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
          StayFlow
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Owners can manage multiple properties from day one.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
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
              minLength={6}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </div>
          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}
          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-teal-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

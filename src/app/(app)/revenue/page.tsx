"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStayFlow } from "@/hooks/useStayFlow";
import {
  financialMetrics,
  monthlyRevenueTrend,
  occupancyMetrics,
  revenueMetrics,
} from "@/lib/metrics";
import { formatCurrency } from "@/lib/utils";
import { KpiCard, PageHeader } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RevenuePage() {
  const { reservations, rooms } = useStayFlow();

  const financials = useMemo(() => financialMetrics(reservations), [reservations]);
  const revenue = useMemo(() => revenueMetrics(reservations), [reservations]);
  const occupancy = useMemo(
    () => occupancyMetrics(rooms, reservations),
    [rooms, reservations]
  );
  const trend = useMemo(() => monthlyRevenueTrend(reservations, 6), [reservations]);

  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of reservations) {
      if (r.status === "cancelled") continue;
      map[r.status] = (map[r.status] ?? 0) + r.total_amount;
    }
    return Object.entries(map).map(([status, amount]) => ({
      status: status.replace("_", " "),
      amount,
    }));
  }, [reservations]);

  return (
    <div>
      <PageHeader
        title="Revenue"
        description="Track collected revenue, outstanding balances, and monthly trends."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total revenue"
          value={formatCurrency(financials.totalRevenue)}
          accent="teal"
        />
        <KpiCard
          label="Deposits collected"
          value={formatCurrency(financials.depositsCollected)}
          accent="blue"
        />
        <KpiCard
          label="Outstanding balances"
          value={formatCurrency(financials.outstandingBalances)}
          accent="amber"
        />
        <KpiCard
          label="Occupancy"
          value={`${occupancy.occupancyRate}%`}
          hint={`ADR ${formatCurrency(revenue.adr)} · RevPAR ${formatCurrency(revenue.revpar)}`}
          accent="slate"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Monthly revenue trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#e2e8f0",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} hide />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#e2e8f0",
                  }}
                />
                <Bar dataKey="amount" fill="#0e7490" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

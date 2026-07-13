"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStayFlow } from "@/hooks/useStayFlow";
import {
  occupancyMetrics,
  revenueMetrics,
  reservationDayMetrics,
} from "@/lib/metrics";
import { formatCurrency, formatDate } from "@/lib/utils";
import { KpiCard, PageHeader } from "@/components/ui/page";
import { ReservationStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { properties, rooms, reservations, user } = useStayFlow();

  const occupancy = useMemo(
    () => occupancyMetrics(rooms, reservations),
    [rooms, reservations]
  );
  const revenue = useMemo(() => revenueMetrics(reservations), [reservations]);
  const resMetrics = useMemo(
    () => reservationDayMetrics(reservations),
    [reservations]
  );

  const recent = useMemo(
    () =>
      [...reservations]
        .filter((r) => r.status !== "cancelled")
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 5),
    [reservations]
  );

  return (
    <div>
      <PageHeader
        title={`Good day, ${user?.full_name.split(" ")[0] ?? "there"}`}
        description={`${properties.length} properties · ${rooms.length} rooms in your portfolio`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/calendar">Open calendar</Link>
            </Button>
            <Button asChild>
              <Link href="/reservations/new">New reservation</Link>
            </Button>
          </>
        }
      />

      <section className="animate-fade-up">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Occupancy
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            label="Occupancy rate"
            value={`${occupancy.occupancyRate}%`}
            hint={`${occupancy.sellableRooms} sellable rooms`}
            accent="teal"
          />
          <KpiCard
            label="Rooms occupied"
            value={occupancy.roomsOccupied}
            hint="In-house tonight"
            accent="blue"
          />
          <KpiCard
            label="Rooms available"
            value={occupancy.roomsAvailable}
            hint="Ready for sale"
            accent="slate"
          />
        </div>
      </section>

      <section className="mt-8 animate-fade-up-delay-1">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Revenue
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Revenue today"
            value={formatCurrency(revenue.revenueToday)}
            accent="teal"
          />
          <KpiCard
            label="Revenue this month"
            value={formatCurrency(revenue.revenueMonth)}
            accent="blue"
          />
          <KpiCard label="ADR" value={formatCurrency(revenue.adr)} hint="Average daily rate" accent="amber" />
          <KpiCard label="RevPAR" value={formatCurrency(revenue.revpar)} hint="Revenue per available room" accent="slate" />
        </div>
      </section>

      <section className="mt-8 animate-fade-up-delay-2">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Reservations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Check-ins today" value={resMetrics.checkInsToday} accent="blue" />
          <KpiCard label="Check-outs today" value={resMetrics.checkOutsToday} accent="amber" />
          <KpiCard label="Upcoming arrivals" value={resMetrics.upcomingArrivals} accent="teal" />
          <KpiCard label="Upcoming departures" value={resMetrics.upcomingDepartures} accent="slate" />
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resMetrics.checkInList.length === 0 && resMetrics.checkOutList.length === 0 ? (
              <p className="text-sm text-slate-500">No arrivals or departures scheduled for today.</p>
            ) : (
              <>
                {resMetrics.checkInList.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Arrival · {r.guest_first_name} {r.guest_last_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(r.check_in)} → {formatDate(r.check_out)}
                      </p>
                    </div>
                    <ReservationStatusBadge status={r.status} />
                  </div>
                ))}
                {resMetrics.checkOutList.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Departure · {r.guest_first_name} {r.guest_last_name}
                      </p>
                      <p className="text-xs text-slate-500">Checkout {formatDate(r.check_out)}</p>
                    </div>
                    <ReservationStatusBadge status={r.status} />
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent reservations</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/reservations">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.map((r) => {
              const room = rooms.find((x) => x.id === r.room_id);
              return (
                <Link
                  key={r.id}
                  href={`/reservations/${r.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {r.guest_first_name} {r.guest_last_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Room {room?.room_number ?? "—"} · {formatCurrency(r.total_amount)}
                    </p>
                  </div>
                  <ReservationStatusBadge status={r.status} />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

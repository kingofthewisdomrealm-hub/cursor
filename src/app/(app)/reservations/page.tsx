"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStayFlow } from "@/hooks/useStayFlow";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ReservationStatus } from "@/types";
import { RESERVATION_STATUS_LABELS } from "@/types";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { ReservationStatusBadge } from "@/components/ui/badge";

export default function ReservationsPage() {
  const { reservations, rooms, properties } = useStayFlow();
  const [status, setStatus] = useState<"all" | ReservationStatus>("all");
  const [propertyId, setPropertyId] = useState("all");

  const filtered = useMemo(() => {
    return [...reservations]
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => (propertyId === "all" ? true : r.property_id === propertyId))
      .sort((a, b) => a.check_in.localeCompare(b.check_in));
  }, [reservations, status, propertyId]);

  return (
    <div>
      <PageHeader
        title="Reservations"
        description="Guest stays, balances, and status across properties."
        actions={
          <Button asChild>
            <Link href="/reservations/new">New reservation</Link>
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <Select
          className="max-w-[200px]"
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | ReservationStatus)}
        >
          <option value="all">All statuses</option>
          {(Object.keys(RESERVATION_STATUS_LABELS) as ReservationStatus[]).map((s) => (
            <option key={s} value={s}>
              {RESERVATION_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          className="max-w-[240px]"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
        >
          <option value="all">All properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No reservations match"
          description="Create a reservation or adjust your filters."
          action={
            <Button asChild>
              <Link href="/reservations/new">New reservation</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Guest</th>
                  <th className="px-4 py-3 font-semibold">Room</th>
                  <th className="px-4 py-3 font-semibold">Stay</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const room = rooms.find((x) => x.id === r.room_id);
                  return (
                    <tr
                      key={r.id}
                      className="border-t border-slate-100 transition hover:bg-teal-50/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/reservations/${r.id}`}
                          className="font-semibold text-slate-900 hover:text-teal-800"
                        >
                          {r.guest_first_name} {r.guest_last_name}
                        </Link>
                        <p className="text-xs text-slate-500">{r.guest_email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {room ? `${room.room_number} · ${room.name}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(r.check_in)} → {formatDate(r.check_out)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(r.total_amount)}
                        </p>
                        {r.remaining_balance > 0 ? (
                          <p className="text-xs text-amber-700">
                            Due {formatCurrency(r.remaining_balance)}
                          </p>
                        ) : (
                          <p className="text-xs text-emerald-700">Paid</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ReservationStatusBadge status={r.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

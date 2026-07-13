"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStayFlow } from "@/hooks/useStayFlow";
import { stayStore } from "@/lib/store";
import { calcStayTotal, hasRoomConflict } from "@/lib/metrics";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ReservationStatus } from "@/types";
import { RESERVATION_STATUS_LABELS } from "@/types";
import { PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ReservationStatusBadge } from "@/components/ui/badge";

export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { reservations, rooms, properties } = useStayFlow();
  const reservation = reservations.find((r) => r.id === params.id);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const room = rooms.find((r) => r.id === reservation?.room_id);
  const property = properties.find((p) => p.id === reservation?.property_id);

  const [form, setForm] = useState(() =>
    reservation
      ? {
          guest_first_name: reservation.guest_first_name,
          guest_last_name: reservation.guest_last_name,
          guest_email: reservation.guest_email,
          guest_phone: reservation.guest_phone,
          check_in: reservation.check_in,
          check_out: reservation.check_out,
          number_of_guests: reservation.number_of_guests,
          deposit_paid: reservation.deposit_paid,
          status: reservation.status,
          internal_notes: reservation.internal_notes,
          guest_requests: reservation.guest_requests,
          room_id: reservation.room_id,
        }
      : null
  );

  const total = useMemo(() => {
    if (!form || !room) return reservation?.total_amount ?? 0;
    const price =
      rooms.find((r) => r.id === form.room_id)?.price_per_night ?? room.price_per_night;
    if (!form.check_in || !form.check_out || form.check_out <= form.check_in) {
      return reservation?.total_amount ?? 0;
    }
    return calcStayTotal(price, form.check_in, form.check_out);
  }, [form, room, rooms, reservation]);

  if (!reservation || !form) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Reservation not found.</p>
        <Button className="mt-4" asChild>
          <Link href="/reservations">Back</Link>
        </Button>
      </div>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form || !reservation) return;
    setError("");
    if (form.check_out <= form.check_in) {
      setError("Check-out must be after check-in.");
      return;
    }
    if (
      hasRoomConflict(
        reservations,
        form.room_id,
        form.check_in,
        form.check_out,
        reservation.id
      )
    ) {
      setError("That room is already booked for overlapping dates.");
      return;
    }
    stayStore.updateReservation(reservation.id, {
      ...form,
      total_amount: total,
      deposit_paid: Number(form.deposit_paid),
      number_of_guests: Number(form.number_of_guests),
    });
    setEditing(false);
  }

  return (
    <div>
      <PageHeader
        title={`${reservation.guest_first_name} ${reservation.guest_last_name}`}
        description={`${property?.name ?? "Property"} · Room ${room?.room_number ?? "—"}`}
        actions={
          <>
            <ReservationStatusBadge status={reservation.status} />
            <Button variant="outline" onClick={() => setEditing((v) => !v)}>
              {editing ? "Cancel edit" : "Edit"}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                stayStore.deleteReservation(reservation.id);
                router.push("/reservations");
              }}
            >
              Delete
            </Button>
          </>
        }
      />

      {!editing ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="space-y-4 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Stay</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(reservation.check_in)} → {formatDate(reservation.check_out)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Guests</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {reservation.number_of_guests}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
                  <p className="mt-1 text-slate-700">{reservation.guest_email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Phone</p>
                  <p className="mt-1 text-slate-700">{reservation.guest_phone || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Guest requests</p>
                <p className="mt-1 text-sm text-slate-700">
                  {reservation.guest_requests || "None"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Internal notes</p>
                <p className="mt-1 text-sm text-slate-700">
                  {reservation.internal_notes || "None"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 pt-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
                <p className="font-display text-3xl font-semibold text-slate-900">
                  {formatCurrency(reservation.total_amount)}
                </p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Deposit paid</span>
                <span className="font-semibold">
                  {formatCurrency(reservation.deposit_paid)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Remaining</span>
                <span className="font-semibold text-amber-700">
                  {formatCurrency(reservation.remaining_balance)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {(["checked_in", "checked_out", "cancelled", "confirmed"] as ReservationStatus[]).map(
                  (s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={reservation.status === s ? "default" : "outline"}
                      onClick={() => stayStore.updateReservation(reservation.id, { status: s })}
                    >
                      {RESERVATION_STATUS_LABELS[s]}
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-5">
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>First name</Label>
                <Input
                  value={form.guest_first_name}
                  onChange={(e) =>
                    setForm({ ...form, guest_first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Last name</Label>
                <Input
                  value={form.guest_last_name}
                  onChange={(e) =>
                    setForm({ ...form, guest_last_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={form.guest_email}
                  onChange={(e) => setForm({ ...form, guest_email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.guest_phone}
                  onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Check-in</Label>
                <Input
                  type="date"
                  value={form.check_in}
                  onChange={(e) => setForm({ ...form, check_in: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Check-out</Label>
                <Input
                  type="date"
                  value={form.check_out}
                  onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Guests</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.number_of_guests}
                  onChange={(e) =>
                    setForm({ ...form, number_of_guests: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Deposit paid</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.deposit_paid}
                  onChange={(e) =>
                    setForm({ ...form, deposit_paid: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as ReservationStatus })
                  }
                >
                  {(Object.keys(RESERVATION_STATUS_LABELS) as ReservationStatus[]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {RESERVATION_STATUS_LABELS[s]}
                      </option>
                    )
                  )}
                </Select>
              </div>
              <div>
                <Label>Recalculated total</Label>
                <Input value={formatCurrency(total)} readOnly />
              </div>
              <div className="sm:col-span-2">
                <Label>Internal notes</Label>
                <Textarea
                  value={form.internal_notes}
                  onChange={(e) =>
                    setForm({ ...form, internal_notes: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Guest requests</Label>
                <Textarea
                  value={form.guest_requests}
                  onChange={(e) =>
                    setForm({ ...form, guest_requests: e.target.value })
                  }
                />
              </div>
              {error ? (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
                  {error}
                </p>
              ) : null}
              <div className="sm:col-span-2">
                <Button type="submit">Save reservation</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

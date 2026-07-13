"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStayFlow } from "@/hooks/useStayFlow";
import { stayStore } from "@/lib/store";
import { calcStayTotal, hasRoomConflict } from "@/lib/metrics";
import { formatCurrency } from "@/lib/utils";
import type { ReservationStatus } from "@/types";
import { RESERVATION_STATUS_LABELS } from "@/types";
import { PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function NewReservationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { properties, rooms, reservations } = useStayFlow();
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");

  const propertyRooms = useMemo(
    () => rooms.filter((r) => r.property_id === propertyId),
    [rooms, propertyId]
  );

  const selectedRoom = rooms.find((r) => r.id === roomId);

  const [form, setForm] = useState({
    guest_first_name: "",
    guest_last_name: "",
    guest_email: "",
    guest_phone: "",
    check_in: "",
    check_out: "",
    number_of_guests: 1,
    deposit_paid: 0,
    status: "confirmed" as ReservationStatus,
    internal_notes: "",
    guest_requests: "",
  });

  useEffect(() => {
    const qRoom = searchParams.get("room_id");
    const qIn = searchParams.get("check_in");
    const qOut = searchParams.get("check_out");
    if (qRoom) {
      const room = rooms.find((r) => r.id === qRoom);
      if (room) {
        setPropertyId(room.property_id);
        setRoomId(room.id);
      }
    }
    if (qIn || qOut) {
      setForm((f) => ({
        ...f,
        check_in: qIn || f.check_in,
        check_out: qOut || f.check_out,
      }));
    }
  }, [searchParams, rooms]);

  const total = useMemo(() => {
    if (!selectedRoom || !form.check_in || !form.check_out) return 0;
    if (form.check_out <= form.check_in) return 0;
    return calcStayTotal(selectedRoom.price_per_night, form.check_in, form.check_out);
  }, [selectedRoom, form.check_in, form.check_out]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!propertyId || !roomId) {
      setError("Select a property and room.");
      return;
    }
    if (form.check_out <= form.check_in) {
      setError("Check-out must be after check-in.");
      return;
    }
    if (hasRoomConflict(reservations, roomId, form.check_in, form.check_out)) {
      setError("That room is already booked for overlapping dates.");
      return;
    }
    const created = stayStore.createReservation({
      property_id: propertyId,
      room_id: roomId,
      ...form,
      total_amount: total,
      deposit_paid: Number(form.deposit_paid),
      number_of_guests: Number(form.number_of_guests),
    });
    router.push(`/reservations/${created.id}`);
  }

  return (
    <div>
      <PageHeader
        title="New reservation"
        description="Capture guest details, stay dates, and payment status."
        actions={
          <Button variant="outline" asChild>
            <Link href="/reservations">Cancel</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-5">
          <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Guest information
              </h2>
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
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
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Stay information
              </h2>
              <div>
                <Label>Property</Label>
                <Select
                  value={propertyId}
                  onChange={(e) => {
                    setPropertyId(e.target.value);
                    setRoomId("");
                  }}
                  required
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Room</Label>
                <Select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select room
                  </option>
                  {propertyRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.room_number} · {r.name} ({formatCurrency(r.price_per_night)}/night)
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              <div>
                <Label>Number of guests</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.number_of_guests}
                  onChange={(e) =>
                    setForm({ ...form, number_of_guests: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Financial
              </h2>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total amount</p>
                <p className="font-display text-2xl font-semibold text-slate-900">
                  {formatCurrency(total)}
                </p>
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
              <p className="text-sm text-slate-500">
                Remaining balance:{" "}
                <span className="font-semibold text-slate-800">
                  {formatCurrency(Math.max(0, total - Number(form.deposit_paid)))}
                </span>
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Notes
              </h2>
              <div>
                <Label>Internal notes</Label>
                <Textarea
                  value={form.internal_notes}
                  onChange={(e) =>
                    setForm({ ...form, internal_notes: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Guest requests</Label>
                <Textarea
                  value={form.guest_requests}
                  onChange={(e) =>
                    setForm({ ...form, guest_requests: e.target.value })
                  }
                />
              </div>
            </section>

            {error ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 lg:col-span-2">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-2 lg:col-span-2">
              <Button type="submit">Create reservation</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

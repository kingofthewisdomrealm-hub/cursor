"use client";

import { FormEvent, useMemo, useState } from "react";
import { useStayFlow } from "@/hooks/useStayFlow";
import { stayStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { Room, RoomStatus } from "@/types";
import { ROOM_STATUS_LABELS } from "@/types";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import { RoomStatusBadge } from "@/components/ui/badge";
import { Users, Moon } from "lucide-react";

const emptyForm = {
  property_id: "",
  name: "",
  room_number: "",
  capacity: 2,
  price_per_night: 150,
  room_type: "Standard",
  description: "",
  status: "available" as RoomStatus,
};

export default function RoomsPage() {
  const { properties, rooms } = useStayFlow();
  const [filterProperty, setFilterProperty] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(
    () =>
      rooms.filter((r) => filterProperty === "all" || r.property_id === filterProperty),
    [rooms, filterProperty]
  );

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      property_id: properties[0]?.id ?? "",
    });
    setOpen(true);
  }

  function openEdit(room: Room) {
    setEditing(room);
    setForm({
      property_id: room.property_id,
      name: room.name,
      room_number: room.room_number,
      capacity: room.capacity,
      price_per_night: room.price_per_night,
      room_type: room.room_type,
      description: room.description,
      status: room.status,
    });
    setOpen(true);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.property_id) return;
    if (editing) {
      stayStore.updateRoom(editing.id, form);
    } else {
      stayStore.createRoom(form);
    }
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Rooms"
        description="Inventory, rates, and housekeeping status across your portfolio."
        actions={
          <Button onClick={openCreate} disabled={properties.length === 0}>
            Add room
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Select
          className="max-w-xs"
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
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
          title="No rooms yet"
          description="Add rooms to a property so you can sell inventory on the calendar."
          action={
            properties.length ? (
              <Button onClick={openCreate}>Add room</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((room, idx) => {
            const property = properties.find((p) => p.id === room.property_id);
            return (
              <div
                key={room.id}
                className="animate-fade-up overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/40 px-5 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {property?.name ?? "Property"}
                      </p>
                      <h3 className="font-display text-xl font-semibold text-slate-900">
                        {room.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Room {room.room_number} · {room.room_type}
                      </p>
                    </div>
                    <RoomStatusBadge status={room.status} />
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <p className="line-clamp-2 text-sm text-slate-600">{room.description}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-teal-700" />
                      Sleeps {room.capacity}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Moon className="h-3.5 w-3.5 text-teal-700" />
                      {formatCurrency(room.price_per_night)} / night
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(room)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => stayStore.deleteRoom(room.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent
          title={editing ? "Edit room" : "New room"}
          description="Set capacity, nightly rate, and current status."
        >
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <Label>Property</Label>
              <Select
                value={form.property_id}
                onChange={(e) => setForm({ ...form, property_id: e.target.value })}
                required
              >
                <option value="" disabled>
                  Select property
                </option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Room name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Room number</Label>
                <Input
                  value={form.room_number}
                  onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <Label>Price per night</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price_per_night}
                  onChange={(e) =>
                    setForm({ ...form, price_per_night: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Room type</Label>
                <Input
                  value={form.room_type}
                  onChange={(e) => setForm({ ...form, room_type: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as RoomStatus })
                  }
                >
                  {(Object.keys(ROOM_STATUS_LABELS) as RoomStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {ROOM_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save changes" : "Create room"}</Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}

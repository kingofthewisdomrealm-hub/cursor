"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useStayFlow } from "@/hooks/useStayFlow";
import { stayStore } from "@/lib/store";
import {
  PROPERTY_TYPE_LABELS,
  type Property,
  type PropertyType,
} from "@/types";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Modal, ModalContent, ModalTrigger } from "@/components/ui/modal";
import { Building2, MapPin } from "lucide-react";

const emptyForm = {
  name: "",
  address: "",
  city: "",
  country: "",
  description: "",
  property_type: "hotel" as PropertyType,
};

export default function PropertiesPage() {
  const { properties, rooms } = useStayFlow();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p: Property) {
    setEditing(p);
    setForm({
      name: p.name,
      address: p.address,
      city: p.city,
      country: p.country,
      description: p.description,
      property_type: p.property_type,
    });
    setOpen(true);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (editing) {
      stayStore.updateProperty(editing.id, form);
    } else {
      stayStore.createProperty(form);
    }
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Properties"
        description="Manage hotels, hostels, and vacation portfolios from one place."
        actions={
          <Modal open={open} onOpenChange={setOpen}>
            <ModalTrigger asChild>
              <Button onClick={openCreate}>Add property</Button>
            </ModalTrigger>
            <ModalContent
              title={editing ? "Edit property" : "New property"}
              description="Each property can contain multiple rooms and reservations."
            >
              <form onSubmit={onSubmit} className="space-y-3">
                <div>
                  <Label>Property name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Property type</Label>
                  <Select
                    value={form.property_type}
                    onChange={(e) =>
                      setForm({ ...form, property_type: e.target.value as PropertyType })
                    }
                  >
                    {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((t) => (
                      <option key={t} value={t}>
                        {PROPERTY_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </Select>
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
                  <Button type="submit">{editing ? "Save changes" : "Create property"}</Button>
                </div>
              </form>
            </ModalContent>
          </Modal>
        }
      />

      {properties.length === 0 ? (
        <EmptyState
          title="No properties yet"
          description="Create your first hotel, hostel, or vacation rental to start managing rooms."
          action={<Button onClick={openCreate}>Add property</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {properties.map((p, idx) => {
            const count = rooms.filter((r) => r.property_id === p.id).length;
            return (
              <div
                key={p.id}
                className="group animate-fade-up overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="h-28 bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-700 p-5 text-white">
                  <div className="flex items-start justify-between">
                    <span className="rounded-md bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide">
                      {PROPERTY_TYPE_LABELS[p.property_type]}
                    </span>
                    <Building2 className="h-5 w-5 text-white/70" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold">{p.name}</h3>
                </div>
                <div className="p-5">
                  <p className="flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {p.address}, {p.city}, {p.country}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {count} rooms
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                        Edit
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/properties/${p.id}`}>Open</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

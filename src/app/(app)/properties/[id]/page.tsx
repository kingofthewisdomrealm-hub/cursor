"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStayFlow } from "@/hooks/useStayFlow";
import { stayStore } from "@/lib/store";
import { PROPERTY_TYPE_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { RoomStatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { properties, rooms, reservations } = useStayFlow();
  const property = properties.find((p) => p.id === params.id);
  const propertyRooms = rooms.filter((r) => r.property_id === params.id);
  const propertyReservations = reservations.filter((r) => r.property_id === params.id);

  if (!property) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Property not found.</p>
        <Button className="mt-4" asChild>
          <Link href="/properties">Back to properties</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={property.name}
        description={`${PROPERTY_TYPE_LABELS[property.property_type]} · ${property.city}, ${property.country}`}
        actions={
          <>
            <Button
              variant="danger"
              onClick={() => {
                stayStore.deleteProperty(property.id);
                router.push("/properties");
              }}
            >
              Delete
            </Button>
            <Button asChild>
              <Link href="/rooms">Manage rooms</Link>
            </Button>
          </>
        }
      />

      <Card className="mb-6">
        <CardContent className="pt-5">
          <p className="text-sm text-slate-600">{property.description}</p>
          <p className="mt-3 text-sm text-slate-500">
            {property.address}, {property.city}, {property.country}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="rounded-lg bg-teal-50 px-3 py-1.5 font-semibold text-teal-800">
              {propertyRooms.length} rooms
            </span>
            <span className="rounded-lg bg-blue-50 px-3 py-1.5 font-semibold text-blue-800">
              {propertyReservations.length} reservations
            </span>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-3 font-display text-xl font-semibold text-slate-900">Rooms</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {propertyRooms.map((room) => (
          <div
            key={room.id}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">
                  {room.name} · #{room.room_number}
                </p>
                <p className="text-xs text-slate-500">{room.room_type}</p>
              </div>
              <RoomStatusBadge status={room.status} />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {formatCurrency(room.price_per_night)} / night · sleeps {room.capacity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

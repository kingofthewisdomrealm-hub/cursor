"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {
  type EventResizeDoneArg,
} from "@fullcalendar/interaction";
import resourcePlugin from "@fullcalendar/resource";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
} from "@fullcalendar/core";
import { useStayFlow } from "@/hooks/useStayFlow";
import { stayStore } from "@/lib/store";
import { hasRoomConflict } from "@/lib/metrics";
import { toISODate } from "@/lib/utils";
import {
  RESERVATION_STATUS_COLORS,
  type Reservation,
} from "@/types";
import { PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import Link from "next/link";

type ViewMode = "resourceTimelineWeek" | "dayGridMonth" | "timeGridWeek" | "timeGridDay";

export function ReservationCalendar() {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);
  const { reservations, rooms, properties } = useStayFlow();
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "all");
  const [view, setView] = useState<ViewMode>("resourceTimelineWeek");
  const [selected, setSelected] = useState<Reservation | null>(null);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) =>
      propertyId === "all" ? true : r.property_id === propertyId
    );
  }, [rooms, propertyId]);

  const filteredReservations = useMemo(() => {
    const roomIds = new Set(filteredRooms.map((r) => r.id));
    return reservations.filter(
      (r) => roomIds.has(r.room_id) && r.status !== "cancelled"
    );
  }, [reservations, filteredRooms]);

  const resources = useMemo(
    () =>
      filteredRooms.map((r) => ({
        id: r.id,
        title: `${r.room_number} · ${r.name}`,
      })),
    [filteredRooms]
  );

  const events = useMemo(
    () =>
      filteredReservations.map((r) => {
        const room = rooms.find((x) => x.id === r.room_id);
        return {
          id: r.id,
          title: `${r.guest_first_name} ${r.guest_last_name} · ${room?.room_number ?? ""}`,
          start: r.check_in,
          end: r.check_out,
          resourceId: r.room_id,
          backgroundColor: RESERVATION_STATUS_COLORS[r.status],
          borderColor: RESERVATION_STATUS_COLORS[r.status],
          extendedProps: { reservation: r },
        };
      }),
    [filteredReservations, rooms]
  );

  const changeView = useCallback((next: ViewMode) => {
    setView(next);
    calendarRef.current?.getApi().changeView(next);
  }, []);

  const onEventDrop = useCallback(
    (info: EventDropArg) => {
      const reservation = reservations.find((r) => r.id === info.event.id);
      if (!reservation) {
        info.revert();
        return;
      }
      const start = info.event.start;
      const end = info.event.end;
      if (!start || !end) {
        info.revert();
        return;
      }
      const check_in = toISODate(start);
      const check_out = toISODate(end);
      const resourceId =
        typeof info.event.getResources === "function"
          ? info.event.getResources()[0]?.id
          : undefined;
      const room_id = resourceId || reservation.room_id;
      if (hasRoomConflict(reservations, room_id, check_in, check_out, reservation.id)) {
        info.revert();
        return;
      }
      stayStore.updateReservation(reservation.id, { check_in, check_out, room_id });
    },
    [reservations]
  );

  const onEventResize = useCallback(
    (info: EventResizeDoneArg) => {
      const reservation = reservations.find((r) => r.id === info.event.id);
      if (!reservation) {
        info.revert();
        return;
      }
      const start = info.event.start;
      const end = info.event.end;
      if (!start || !end) {
        info.revert();
        return;
      }
      const check_in = toISODate(start);
      const check_out = toISODate(end);
      if (
        hasRoomConflict(
          reservations,
          reservation.room_id,
          check_in,
          check_out,
          reservation.id
        )
      ) {
        info.revert();
        return;
      }
      stayStore.updateReservation(reservation.id, { check_in, check_out });
    },
    [reservations]
  );

  const onEventClick = useCallback((info: EventClickArg) => {
    const reservation = info.event.extendedProps.reservation as Reservation;
    setSelected(reservation);
  }, []);

  const onSelect = useCallback(
    (info: DateSelectArg) => {
      const params = new URLSearchParams({
        check_in: toISODate(info.start),
        check_out: toISODate(info.end),
      });
      if (info.resource?.id) params.set("room_id", info.resource.id);
      router.push(`/reservations/new?${params.toString()}`);
    },
    [router]
  );

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Drag to move stays, resize to change dates, click for guest details."
        actions={
          <Button asChild>
            <Link href="/reservations/new">New reservation</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
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
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {(
            [
              ["resourceTimelineWeek", "Rooms"],
              ["dayGridMonth", "Month"],
              ["timeGridWeek", "Week"],
              ["timeGridDay", "Day"],
            ] as [ViewMode, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => changeView(value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                view === value
                  ? "bg-teal-700 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-3 text-xs font-semibold">
          {(
            [
              ["confirmed", "Confirmed"],
              ["pending", "Pending"],
              ["checked_in", "Checked In"],
              ["cancelled", "Cancelled"],
            ] as const
          ).map(([key, label]) => (
            <span key={key} className="inline-flex items-center gap-1.5 text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: RESERVATION_STATUS_COLORS[key] }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="animate-fade-up rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            resourcePlugin,
            resourceTimelinePlugin,
          ]}
          initialView={view}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          height="auto"
          resources={resources}
          events={events}
          editable
          selectable
          eventResourceEditable
          eventDrop={onEventDrop}
          eventResize={onEventResize}
          eventClick={onEventClick}
          select={onSelect}
          resourceAreaHeaderContent="Rooms"
          resourceAreaWidth="180px"
          slotMinWidth={48}
          schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        />
      </div>

      <Modal open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <ModalContent
          title={
            selected
              ? `${selected.guest_first_name} ${selected.guest_last_name}`
              : "Reservation"
          }
          description={
            selected
              ? `${selected.check_in} → ${selected.check_out}`
              : undefined
          }
        >
          {selected ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Status:{" "}
                <span className="font-semibold capitalize">
                  {selected.status.replace("_", " ")}
                </span>
              </p>
              <p className="text-sm text-slate-600">
                Remaining balance: ${selected.remaining_balance}
              </p>
              {selected.guest_requests ? (
                <p className="text-sm text-slate-600">
                  Requests: {selected.guest_requests}
                </p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
                <Button asChild>
                  <Link href={`/reservations/${selected.id}`}>Open details</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </ModalContent>
      </Modal>
    </div>
  );
}

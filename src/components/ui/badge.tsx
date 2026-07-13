import { cn } from "@/lib/utils";
import type { ReservationStatus, RoomStatus } from "@/types";
import {
  RESERVATION_STATUS_COLORS,
  RESERVATION_STATUS_LABELS,
  ROOM_STATUS_LABELS,
} from "@/types";

const roomStatusStyles: Record<RoomStatus, string> = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  occupied: "bg-blue-50 text-blue-700 ring-blue-200",
  cleaning: "bg-amber-50 text-amber-750 text-amber-700 ring-amber-200",
  maintenance: "bg-orange-50 text-orange-700 ring-orange-200",
  out_of_service: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
        className
      )}
      {...props}
    />
  );
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <Badge
      style={{
        backgroundColor: `${RESERVATION_STATUS_COLORS[status]}18`,
        color: RESERVATION_STATUS_COLORS[status],
        boxShadow: `inset 0 0 0 1px ${RESERVATION_STATUS_COLORS[status]}33`,
      }}
    >
      {RESERVATION_STATUS_LABELS[status]}
    </Badge>
  );
}

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return (
    <Badge className={roomStatusStyles[status]}>{ROOM_STATUS_LABELS[status]}</Badge>
  );
}

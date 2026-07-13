"use client";

import dynamic from "next/dynamic";

const ReservationCalendar = dynamic(
  () =>
    import("@/components/calendar/ReservationCalendar").then(
      (m) => m.ReservationCalendar
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
      </div>
    ),
  }
);

export default function CalendarPage() {
  return <ReservationCalendar />;
}

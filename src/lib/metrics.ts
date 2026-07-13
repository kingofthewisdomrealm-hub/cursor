import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, isSameDay } from "date-fns";
import type { Reservation, Room } from "@/types";
import { toISODate } from "@/lib/utils";

export function isActiveReservation(r: Reservation) {
  return r.status !== "cancelled";
}

export function occupancyMetrics(rooms: Room[], reservations: Reservation[], date = new Date()) {
  const day = toISODate(date);
  const sellable = rooms.filter((r) => r.status !== "out_of_service" && r.status !== "maintenance");
  const occupiedTonight = reservations.filter((r) => {
    if (r.status === "cancelled" || r.status === "checked_out") return false;
    return r.check_in <= day && r.check_out > day;
  });
  const roomsOccupied = occupiedTonight.length;
  const roomsAvailable = Math.max(0, sellable.length - roomsOccupied);
  const occupancyRate = sellable.length
    ? Math.round((roomsOccupied / sellable.length) * 100)
    : 0;
  return { occupancyRate, roomsOccupied, roomsAvailable, sellableRooms: sellable.length };
}

function revenueOnDate(reservations: Reservation[], date: string) {
  return reservations
    .filter((r) => isActiveReservation(r) && r.check_in <= date && r.check_out > date)
    .reduce((sum, r) => {
      const nights = Math.max(
        1,
        Math.round(
          (parseISO(r.check_out).getTime() - parseISO(r.check_in).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      return sum + r.total_amount / nights;
    }, 0);
}

export function revenueMetrics(reservations: Reservation[], date = new Date()) {
  const today = toISODate(date);
  const monthStart = startOfMonth(date);
  const days = eachDayOfInterval({ start: monthStart, end: date });

  const revenueToday = Math.round(revenueOnDate(reservations, today));

  let revenueMonth = 0;
  for (const d of days) {
    revenueMonth += revenueOnDate(reservations, toISODate(d));
  }
  revenueMonth = Math.round(revenueMonth);

  const occupiedRoomNights = days.reduce((acc, d) => {
    const iso = toISODate(d);
    const count = reservations.filter(
      (r) => isActiveReservation(r) && r.check_in <= iso && r.check_out > iso
    ).length;
    return acc + count;
  }, 0);

  const adr = occupiedRoomNights ? Math.round(revenueMonth / occupiedRoomNights) : 0;
  // Approx sellable inventory using unique rooms appearing in reservations + a floor
  const uniqueRooms = new Set(
    reservations.filter(isActiveReservation).map((r) => r.room_id)
  ).size;
  const availableRoomNights = Math.max(occupiedRoomNights, days.length * Math.max(uniqueRooms, 1));
  const revpar = availableRoomNights ? Math.round(revenueMonth / availableRoomNights) : 0;

  return { revenueToday, revenueMonth, adr, revpar };
}

export function reservationDayMetrics(reservations: Reservation[], date = new Date()) {
  const day = toISODate(date);
  const checkInsToday = reservations.filter(
    (r) => r.check_in === day && r.status !== "cancelled"
  );
  const checkOutsToday = reservations.filter(
    (r) => r.check_out === day && r.status !== "cancelled"
  );
  const upcomingArrivals = reservations.filter(
    (r) => r.check_in > day && (r.status === "confirmed" || r.status === "pending")
  );
  const upcomingDepartures = reservations.filter(
    (r) => r.check_out > day && (r.status === "checked_in" || r.status === "confirmed")
  );
  return {
    checkInsToday: checkInsToday.length,
    checkOutsToday: checkOutsToday.length,
    upcomingArrivals: upcomingArrivals.length,
    upcomingDepartures: upcomingDepartures.length,
    checkInList: checkInsToday,
    checkOutList: checkOutsToday,
  };
}

export function financialMetrics(reservations: Reservation[]) {
  const active = reservations.filter(isActiveReservation);
  const totalRevenue = active.reduce((s, r) => s + r.total_amount, 0);
  const depositsCollected = active.reduce((s, r) => s + r.deposit_paid, 0);
  const outstandingBalances = active.reduce((s, r) => s + r.remaining_balance, 0);
  return { totalRevenue, depositsCollected, outstandingBalances };
}

export function monthlyRevenueTrend(reservations: Reservation[], months = 6) {
  const now = new Date();
  const points: { month: string; revenue: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const days = eachDayOfInterval({ start, end });
    let revenue = 0;
    for (const day of days) {
      revenue += revenueOnDate(reservations, toISODate(day));
    }
    points.push({
      month: format(d, "MMM"),
      revenue: Math.round(revenue),
    });
  }

  return points;
}

export function roomOccupiedOn(roomId: string, reservations: Reservation[], date: string) {
  return reservations.some(
    (r) =>
      r.room_id === roomId &&
      r.status !== "cancelled" &&
      r.status !== "checked_out" &&
      r.check_in <= date &&
      r.check_out > date
  );
}

export function calcStayTotal(pricePerNight: number, checkIn: string, checkOut: string) {
  const nights = Math.max(
    1,
    Math.round(
      (parseISO(checkOut).getTime() - parseISO(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  return nights * pricePerNight;
}

export function overlaps(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
) {
  return aStart < bEnd && bStart < aEnd;
}

export function hasRoomConflict(
  reservations: Reservation[],
  roomId: string,
  checkIn: string,
  checkOut: string,
  excludeId?: string
) {
  return reservations.some(
    (r) =>
      r.room_id === roomId &&
      r.id !== excludeId &&
      r.status !== "cancelled" &&
      overlaps(r.check_in, r.check_out, checkIn, checkOut)
  );
}

export function isSameCalendarDay(a: Date, b: Date) {
  return isSameDay(a, b);
}

export function staysContaining(reservations: Reservation[], date: Date) {
  return reservations.filter((r) =>
    isWithinInterval(date, {
      start: parseISO(r.check_in),
      end: parseISO(r.check_out),
    })
  );
}

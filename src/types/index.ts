export type UserRole = "owner" | "manager" | "receptionist" | "housekeeping";

export type PropertyType =
  | "hotel"
  | "hostel"
  | "airbnb"
  | "apartment"
  | "vacation_rental";

export type RoomStatus =
  | "available"
  | "occupied"
  | "cleaning"
  | "maintenance"
  | "out_of_service";

export type ReservationStatus =
  | "confirmed"
  | "pending"
  | "checked_in"
  | "checked_out"
  | "cancelled";

export type HousekeepingTaskType =
  | "clean_room"
  | "inspect_room"
  | "laundry"
  | "maintenance_request";

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  description: string;
  property_type: PropertyType;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  property_id: string;
  name: string;
  room_number: string;
  capacity: number;
  price_per_night: number;
  room_type: string;
  description: string;
  status: RoomStatus;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  property_id: string;
  room_id: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  number_of_guests: number;
  total_amount: number;
  deposit_paid: number;
  remaining_balance: number;
  internal_notes: string;
  guest_requests: string;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

export interface HousekeepingTask {
  id: string;
  property_id: string;
  room_id: string;
  task_type: HousekeepingTaskType;
  status: TaskStatus;
  notes: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type:
    | "check_in"
    | "check_out"
    | "unpaid"
    | "new_reservation"
    | "maintenance";
  read: boolean;
  created_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface StayFlowState {
  user: Profile | null;
  users: AppUser[];
  properties: Property[];
  rooms: Room[];
  reservations: Reservation[];
  housekeeping_tasks: HousekeepingTask[];
  notifications: Notification[];
}

export const RESERVATION_STATUS_COLORS: Record<ReservationStatus, string> = {
  confirmed: "#16a34a",
  pending: "#ca8a04",
  checked_in: "#2563eb",
  checked_out: "#64748b",
  cancelled: "#dc2626",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  hotel: "Hotel",
  hostel: "Hostel",
  airbnb: "Airbnb",
  apartment: "Apartment",
  vacation_rental: "Vacation Rental",
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: "Available",
  occupied: "Occupied",
  cleaning: "Cleaning",
  maintenance: "Maintenance",
  out_of_service: "Out of Service",
};

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  manager: "Manager",
  receptionist: "Receptionist",
  housekeeping: "Housekeeping",
};

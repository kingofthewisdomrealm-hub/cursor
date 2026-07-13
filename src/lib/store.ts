"use client";

import { createSeedState, DEMO_PROFILE } from "@/lib/seed-data";
import { nightsBetween, uid } from "@/lib/utils";
import type {
  AppUser,
  HousekeepingTask,
  Notification,
  Profile,
  Property,
  Reservation,
  Room,
  StayFlowState,
  UserRole,
} from "@/types";

const STORAGE_KEY = "stayflow_state_v1";
const SESSION_KEY = "stayflow_session_v1";

type Listener = () => void;

let memoryState: StayFlowState | null = null;
const listeners = new Set<Listener>();

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function loadState(): StayFlowState {
  if (memoryState) return memoryState;

  const seed = createSeedState();
  if (!canUseStorage()) {
    memoryState = seed;
    return seed;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StayFlowState;
      memoryState = {
        ...seed,
        ...parsed,
        users: parsed.users?.length ? parsed.users : seed.users,
      };
    } else {
      memoryState = seed;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    }
  } catch {
    memoryState = seed;
  }

  const sessionId = localStorage.getItem(SESSION_KEY);
  if (sessionId && memoryState) {
    const user = memoryState.users.find((u) => u.id === sessionId);
    if (user) {
      memoryState.user = toProfile(user);
    }
  }

  return memoryState!;
}

function persist(state: StayFlowState) {
  memoryState = state;
  if (canUseStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.user) {
      localStorage.setItem(SESSION_KEY, state.user.id);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }
  listeners.forEach((l) => l());
}

function toProfile(user: AppUser): Profile {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    created_at: new Date().toISOString(),
  };
}

function update(mutator: (state: StayFlowState) => StayFlowState) {
  const next = mutator(structuredClone(loadState()));
  persist(next);
  return next;
}

export const stayStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getState(): StayFlowState {
    return loadState();
  },

  resetDemo() {
    const seed = createSeedState();
    seed.user = DEMO_PROFILE;
    persist(seed);
    if (canUseStorage()) localStorage.setItem(SESSION_KEY, DEMO_PROFILE.id);
  },

  login(email: string, password: string): { ok: true; user: Profile } | { ok: false; error: string } {
    const state = loadState();
    const user = state.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { ok: false, error: "Invalid email or password." };
    update((s) => ({ ...s, user: toProfile(user) }));
    return { ok: true, user: toProfile(user) };
  },

  signup(input: {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
  }): { ok: true; user: Profile } | { ok: false; error: string } {
    const state = loadState();
    if (state.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const user: AppUser = {
      id: uid("user"),
      email: input.email,
      password: input.password,
      full_name: input.full_name,
      role: input.role,
    };
    update((s) => ({
      ...s,
      users: [...s.users, user],
      user: toProfile(user),
    }));
    return { ok: true, user: toProfile(user) };
  },

  logout() {
    update((s) => ({ ...s, user: null }));
  },

  requestPasswordReset(email: string): { ok: true; message: string } | { ok: false; error: string } {
    const state = loadState();
    const exists = state.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) return { ok: false, error: "No account found for that email." };
    return {
      ok: true,
      message: "Password reset link sent (demo). Use password demo1234 for seeded accounts.",
    };
  },

  createProperty(
    data: Omit<Property, "id" | "owner_id" | "created_at" | "updated_at">
  ): Property {
    const now = new Date().toISOString();
    const property: Property = {
      ...data,
      id: uid("prop"),
      owner_id: loadState().user?.id ?? OWNER_FALLBACK,
      created_at: now,
      updated_at: now,
    };
    update((s) => ({ ...s, properties: [property, ...s.properties] }));
    return property;
  },

  updateProperty(id: string, patch: Partial<Property>): Property | null {
    let updated: Property | null = null;
    update((s) => ({
      ...s,
      properties: s.properties.map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, ...patch, updated_at: new Date().toISOString() };
        return updated;
      }),
    }));
    return updated;
  },

  deleteProperty(id: string) {
    update((s) => ({
      ...s,
      properties: s.properties.filter((p) => p.id !== id),
      rooms: s.rooms.filter((r) => r.property_id !== id),
      reservations: s.reservations.filter((r) => r.property_id !== id),
      housekeeping_tasks: s.housekeeping_tasks.filter((t) => t.property_id !== id),
    }));
  },

  createRoom(data: Omit<Room, "id" | "created_at" | "updated_at">): Room {
    const now = new Date().toISOString();
    const room: Room = { ...data, id: uid("room"), created_at: now, updated_at: now };
    update((s) => ({ ...s, rooms: [room, ...s.rooms] }));
    return room;
  },

  updateRoom(id: string, patch: Partial<Room>): Room | null {
    let updated: Room | null = null;
    update((s) => ({
      ...s,
      rooms: s.rooms.map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, ...patch, updated_at: new Date().toISOString() };
        return updated;
      }),
    }));
    return updated;
  },

  deleteRoom(id: string) {
    update((s) => ({
      ...s,
      rooms: s.rooms.filter((r) => r.id !== id),
      reservations: s.reservations.filter((r) => r.room_id !== id),
    }));
  },

  createReservation(
    data: Omit<Reservation, "id" | "created_at" | "updated_at" | "remaining_balance">
  ): Reservation {
    const now = new Date().toISOString();
    const reservation: Reservation = {
      ...data,
      id: uid("res"),
      remaining_balance: Math.max(0, data.total_amount - data.deposit_paid),
      created_at: now,
      updated_at: now,
    };
    update((s) => ({
      ...s,
      reservations: [reservation, ...s.reservations],
      notifications: [
        {
          id: uid("notif"),
          user_id: s.user?.id ?? OWNER_FALLBACK,
          title: "New reservation",
          message: `${data.guest_first_name} ${data.guest_last_name} booked ${nightsBetween(data.check_in, data.check_out)} night(s).`,
          type: "new_reservation",
          read: false,
          created_at: now,
        } satisfies Notification,
        ...s.notifications,
      ],
    }));
    return reservation;
  },

  updateReservation(id: string, patch: Partial<Reservation>): Reservation | null {
    let updated: Reservation | null = null;
    update((s) => ({
      ...s,
      reservations: s.reservations.map((r) => {
        if (r.id !== id) return r;
        const merged = { ...r, ...patch, updated_at: new Date().toISOString() };
        merged.remaining_balance = Math.max(0, merged.total_amount - merged.deposit_paid);
        updated = merged;
        return merged;
      }),
    }));
    return updated;
  },

  deleteReservation(id: string) {
    update((s) => ({
      ...s,
      reservations: s.reservations.filter((r) => r.id !== id),
    }));
  },

  updateTask(id: string, patch: Partial<HousekeepingTask>) {
    update((s) => ({
      ...s,
      housekeeping_tasks: s.housekeeping_tasks.map((t) =>
        t.id === id ? { ...t, ...patch, updated_at: new Date().toISOString() } : t
      ),
    }));
  },

  markNotificationRead(id: string) {
    update((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllNotificationsRead() {
    update((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  },
};

const OWNER_FALLBACK = "user_owner_demo";

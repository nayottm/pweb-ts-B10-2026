import { KEYS } from "./types.js";

export type Role = "admin" | "moderator" | "user";

export interface Session {
  token: string;
  role: Role;
  firstName: string;
}

export function saveSession(s: Session): void {
  localStorage.setItem(KEYS.session, JSON.stringify(s));
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEYS.session);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.session);
}

// Moderator diperlakukan sama dengan admin
export function isAdmin(s: Session | null): boolean {
  return !!s && (s.role === "admin" || s.role === "moderator");
}

// Auth guard: panggil di awal operator.ts
export function requireAuth(): Session {
  const s = getSession();
  if (!s) {
    window.location.href = "login.html";
    throw new Error("Belum login");
  }
  return s;
}

// Role guard: panggil di awal index.ts (dashboard admin)
export function requireAdmin(): Session {
  const s = getSession();
  if (!s || !isAdmin(s)) {
    window.location.href = "login.html";
    throw new Error("Akses ditolak");
  }
  return s;
}

export function logout(): void {
  clearSession();
  window.location.href = "login.html";
}
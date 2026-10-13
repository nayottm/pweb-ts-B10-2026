import { KEYS } from "./types.js";
export function saveSession(s) {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(s));
}
export function getSession() {
    try {
        const raw = localStorage.getItem(KEYS.SESSION);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
export function clearSession() {
    localStorage.removeItem(KEYS.SESSION);
}
// Moderator diperlakukan sama dengan admin
export function isAdmin(s) {
    return !!s && (s.role === "admin" || s.role === "moderator");
}
// Auth guard: panggil di awal operator.ts
export function requireAuth() {
    const s = getSession();
    if (!s) {
        window.location.href = "login.html";
        throw new Error("Belum login");
    }
    return s;
}
// Role guard: panggil di awal index.ts (dashboard admin)
export function requireAdmin() {
    const s = getSession();
    if (!s || !isAdmin(s)) {
        window.location.href = "login.html";
        throw new Error("Akses ditolak");
    }
    return s;
}
export function logout() {
    clearSession();
    window.location.href = "login.html";
}

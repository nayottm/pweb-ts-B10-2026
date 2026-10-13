"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSession = saveSession;
exports.getSession = getSession;
exports.clearSession = clearSession;
exports.isAdmin = isAdmin;
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
exports.logout = logout;
const types_js_1 = require("./types.js");
function saveSession(s) {
    localStorage.setItem(types_js_1.KEYS.SESSION, JSON.stringify(s));
}
function getSession() {
    try {
        const raw = localStorage.getItem(types_js_1.KEYS.SESSION);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
function clearSession() {
    localStorage.removeItem(types_js_1.KEYS.SESSION);
}
// Moderator diperlakukan sama dengan admin
function isAdmin(s) {
    return !!s && (s.role === "admin" || s.role === "moderator");
}
// Auth guard: panggil di awal operator.ts
function requireAuth() {
    const s = getSession();
    if (!s) {
        window.location.href = "login.html";
        throw new Error("Belum login");
    }
    return s;
}
// Role guard: panggil di awal index.ts (dashboard admin)
function requireAdmin() {
    const s = getSession();
    if (!s || !isAdmin(s)) {
        window.location.href = "login.html";
        throw new Error("Akses ditolak");
    }
    return s;
}
function logout() {
    clearSession();
    window.location.href = "login.html";
}

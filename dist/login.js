"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_js_1 = require("./auth.js");
const form = document.getElementById("loginForm");
const btn = document.getElementById("submitBtn");
const errorEl = document.getElementById("error");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const API = "https://dummyjson.com";
function redirectByRole(role) {
    // Admin/moderator ke dashboard, user biasa ke operator
    window.location.href = role === "admin" || role === "moderator" ? "index.html" : "operator.html";
}
function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
}
function setLoading(loading) {
    btn.disabled = loading;
    btn.textContent = loading ? "Memproses..." : "Masuk";
}
// Kalau sudah login, langsung arahkan
const existing = (0, auth_js_1.getSession)();
if (existing)
    redirectByRole(existing.role);
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const username = usernameEl.value.trim();
    const password = passwordEl.value;
    if (!username || !password) {
        showError("Username dan password wajib diisi.");
        return;
    }
    setLoading(true);
    try {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok)
            throw new Error(data.message ?? "Username atau password salah.");
        const token = data.accessToken;
        // Ambil role dari server. Kalau response login tidak memuatnya, tanya /auth/me
        let role = data.role;
        if (!role) {
            const meRes = await fetch(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!meRes.ok)
                throw new Error("Gagal mengambil data pengguna.");
            role = (await meRes.json()).role;
        }
        const finalRole = role ?? "user";
        (0, auth_js_1.saveSession)({ token, role: finalRole, firstName: data.firstName });
        redirectByRole(finalRole);
    }
    catch (err) {
        if (err instanceof TypeError) {
            showError("Koneksi jaringan gagal. Periksa internet Anda.");
        }
        else {
            showError(err instanceof Error ? err.message : "Terjadi kesalahan.");
        }
    }
    finally {
        setLoading(false);
    }
});

import { saveSession, getSession } from "./auth.js";
import type { Role } from "./auth.js";

const form = document.getElementById("loginForm") as HTMLFormElement;
const btn = document.getElementById("submitBtn") as HTMLButtonElement;
const errorEl = document.getElementById("error") as HTMLElement;
const usernameEl = document.getElementById("username") as HTMLInputElement;
const passwordEl = document.getElementById("password") as HTMLInputElement;

const API = "https://dummyjson.com";

function redirectByRole(role: Role): void {
  // Sesuai soal: Admin ke Dashboard, User ke Ambil Antrian
  window.location.href = (role === "admin" || role === "moderator") ? "index.html" : "queue.html";
}

function showError(msg: string): void {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

function setLoading(loading: boolean): void {
  btn.disabled = loading;
  btn.textContent = loading ? "Memproses..." : "Masuk";
}

const existing = getSession();
const syncToken = localStorage.getItem("token");

if (existing && syncToken) {
  redirectByRole(existing.role);
} else {
  localStorage.removeItem("session");
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("firstName");
}

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
    if (!res.ok) throw new Error(data.message ?? "Username atau password salah.");

    const token: string = data.accessToken;

    let role: Role | undefined = data.role;
    if (!role) {
      const meRes = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) throw new Error("Gagal mengambil data pengguna.");
      role = (await meRes.json()).role;
    }

    // Murni membaca dari API DummyJSON sesuai soal
    const finalRole: Role = role ?? "user";

    saveSession({ token, role: finalRole, firstName: data.firstName });
    redirectByRole(finalRole);
  } catch (err) {
    if (err instanceof TypeError) {
      showError("Koneksi jaringan gagal. Periksa internet Anda.");
    } else {
      showError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  } finally {
    setLoading(false);
  }
});
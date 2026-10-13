import { saveSession, getSession } from "./auth.js";
const form = document.getElementById("loginForm");
const btn = document.getElementById("submitBtn");
const errorEl = document.getElementById("error");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const API = "https://dummyjson.com";
function redirectByRole(role) {
    // Sesuai soal: Admin ke Dashboard, User ke Ambil Antrian
    window.location.href = (role === "admin" || role === "moderator") ? "index.html" : "queue.html";
}
function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
}
function setLoading(loading) {
    btn.disabled = loading;
    btn.textContent = loading ? "Memproses..." : "Masuk";
}
const existing = getSession();
const syncToken = localStorage.getItem("token");
if (existing && syncToken) {
    redirectByRole(existing.role);
}
else {
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
        if (!res.ok)
            throw new Error(data.message ?? "Username atau password salah.");
        const token = data.accessToken;
        let role = data.role;
        if (!role) {
            const meRes = await fetch(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!meRes.ok)
                throw new Error("Gagal mengambil data pengguna.");
            role = (await meRes.json()).role;
        }
        // Murni membaca dari API DummyJSON sesuai soal
        const finalRole = role ?? "user";
        saveSession({ token, role: finalRole, firstName: data.firstName });
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

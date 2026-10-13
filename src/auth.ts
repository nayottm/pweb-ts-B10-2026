export type Role = "admin" | "moderator" | "user";

export interface Session {
    token: string;
    role: Role;
    firstName: string;
}

export function saveSession(session: Session): void {
    localStorage.setItem("session", JSON.stringify(session));
    localStorage.setItem("token", session.token);
    localStorage.setItem("role", session.role);
    localStorage.setItem("firstName", session.firstName);
}

export function getSession(): Session | null {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as Role;
    const firstName = localStorage.getItem("firstName");
    if (token && role && firstName) return { token, role, firstName };
    return null;
}

export function clearSession(): void {
    localStorage.removeItem("session");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("firstName");
}

// Fungsi Pelindung Halaman Berdasarkan Soal
export function guardPage(allowedRoles: Role[]): void {
    const session = getSession();
    
    // 1. Wajib Login
    if (!session) {
        window.location.href = "login.html";
        return;
    }

    // 2. Filter Hak Akses Role
    if (!allowedRoles.includes(session.role)) {
        // Jika tidak punya akses, kembalikan ke habitat asalnya
        if (session.role === "admin" || session.role === "moderator") {
            window.location.href = "index.html"; // Admin dikembalikan ke Dashboard
        } else {
            window.location.href = "queue.html"; // User dikembalikan ke Ambil Antrian
        }
    }
}
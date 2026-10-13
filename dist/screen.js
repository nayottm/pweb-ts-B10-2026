import { KEYS } from "./types.js";
const POLL_MS = 2500; // soal minta polling 2-3 detik
const cardsEl = document.getElementById("cards");
const updatedEl = document.getElementById("updated");
const fsBtn = document.getElementById("fsBtn");
function read(key) {
    try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className)
        node.className = className;
    if (text !== undefined)
        node.textContent = text; // textContent: aman dari injeksi HTML
    return node;
}
function buildCard(type, tickets) {
    const called = tickets.find((t) => t.typeCode === type.code && t.status === "called");
    const waiting = tickets.filter((t) => t.typeCode === type.code && t.status === "waiting").length;
    const card = el("section", "card screen-card");
    const head = el("div", "card-head");
    head.append(el("h2", "", type.name), el("span", "badge", type.code));
    const body = el("div", "card-body");
    if (called) {
        body.append(el("span", "status-called", "● DIPANGGIL"), el("div", "number", called.ticketNumber));
    }
    else {
        body.append(el("p", "empty-title", "Belum ada nomor dipanggil"), el("p", "muted small", "Nomor akan muncul setelah operator memanggil tiket."));
    }
    const foot = el("div", "card-foot", `${waiting} tiket menunggu`);
    card.append(head, body, foot);
    return card;
}
function render() {
    const types = read(KEYS.QUEUE_TYPES).filter((t) => t.active);
    const tickets = read(KEYS.TICKETS);
    cardsEl.replaceChildren();
    if (types.length === 0) {
        cardsEl.append(el("p", "muted", "Belum ada jenis antrian aktif."));
    }
    else {
        for (const t of types)
            cardsEl.append(buildCard(t, tickets));
    }
    updatedEl.textContent = "Diperbarui " + new Date().toLocaleTimeString("id-ID");
}
// --- Fullscreen API ---
function updateFsLabel() {
    fsBtn.textContent = document.fullscreenElement ? "Keluar Layar Penuh" : "Layar Penuh";
}
fsBtn.addEventListener("click", async () => {
    try {
        if (document.fullscreenElement)
            await document.exitFullscreen();
        else
            await document.documentElement.requestFullscreen();
    }
    catch {
        alert("Browser tidak mengizinkan layar penuh.");
    }
});
document.addEventListener("fullscreenchange", updateFsLabel);
// --- Real-time: polling + event storage ---
render();
setInterval(render, POLL_MS);
window.addEventListener("storage", render); // update instan kalau tab lain mengubah data

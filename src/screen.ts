import { KEYS } from "./types.js";
import type { QueueType, Ticket } from "./types.js";

const POLL_MS = 2500; // soal minta polling 2-3 detik

const cardsEl = document.getElementById("cards") as HTMLElement;
const updatedEl = document.getElementById("updated") as HTMLElement;
const fsBtn = document.getElementById("fsBtn") as HTMLButtonElement;

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, className?: string, text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text; // textContent: aman dari injeksi HTML
  return node;
}

function buildCard(type: QueueType, tickets: Ticket[]): HTMLElement {
  const called = tickets.find(
    (t) => t.queueTypeId === type.id && t.status === "Dipanggil"
  );
  const waiting = tickets.filter(
    (t) => t.queueTypeId === type.id && t.status === "Menunggu"
  ).length;

  const card = el("section", "card screen-card");

  const head = el("div", "card-head");
  head.append(el("h2", "", type.name), el("span", "badge", type.code));

  const body = el("div", "card-body");
  if (called) {
    body.append(el("span", "status-called", "● DIPANGGIL"), el("div", "number", called.number));
  } else {
    body.append(
      el("p", "empty-title", "Belum ada nomor dipanggil"),
      el("p", "muted small", "Nomor akan muncul setelah operator memanggil tiket.")
    );
  }

  const foot = el("div", "card-foot", `${waiting} tiket menunggu`);

  card.append(head, body, foot);
  return card;
}

function render(): void {
  const types = read<QueueType>(KEYS.queueTypes).filter((t) => t.active);
  const tickets = read<Ticket>(KEYS.tickets);

  cardsEl.replaceChildren();
  if (types.length === 0) {
    cardsEl.append(el("p", "muted", "Belum ada jenis antrian aktif."));
  } else {
    for (const t of types) cardsEl.append(buildCard(t, tickets));
  }

  updatedEl.textContent = "Diperbarui " + new Date().toLocaleTimeString("id-ID");
}

// --- Fullscreen API ---
function updateFsLabel(): void {
  fsBtn.textContent = document.fullscreenElement ? "Keluar Layar Penuh" : "Layar Penuh";
}

fsBtn.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    alert("Browser tidak mengizinkan layar penuh.");
  }
});
document.addEventListener("fullscreenchange", updateFsLabel);

// --- Real-time: polling + event storage ---
render();
setInterval(render, POLL_MS);
window.addEventListener("storage", render); // update instan kalau tab lain mengubah data
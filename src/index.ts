import {
  getQueueTypes,
  addQueueType,
  toggleQueueType,
  deleteQueueType
} from "./queryTypes.js"; // ⬅️ Hapus type QueueType dari sini

import type { QueueType } from "./types.js"; // ⬅️ Tambahkan baris ini

import {
  generateTicket,
  getTickets,
  resetTickets,
  type Priority,
  type Ticket
} from "./tickets.js";

// Mengambil elemen HTML
const queueForm = document.querySelector<HTMLFormElement>("#queueForm")!;
const ticketForm = document.querySelector<HTMLFormElement>("#ticketForm")!;
const queueList = document.querySelector<HTMLElement>("#queueList")!;
const ticketList = document.querySelector<HTMLElement>("#ticketList")!;
const ticketQueue = document.querySelector<HTMLSelectElement>("#ticketQueue")!;
const ticketResult = document.querySelector<HTMLElement>("#ticketResult")!;
const message = document.querySelector<HTMLElement>("#message")!;
const issueButton = document.querySelector<HTMLButtonElement>("#issueButton")!;
const userInfo = document.querySelector<HTMLElement>("#userInfo")!;

// Mengamankan teks sebelum dimasukkan ke HTML
function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (char: string) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[char];
  });
}

// Menampilkan pesan
function showMessage(text: string): void {
  message.hidden = false;
  message.textContent = text;
}

// Menampilkan jenis antrian
function renderQueues(): void {
  // Ditambahkan tipe QueueType[] agar tidak implicit any
  const queues: QueueType[] = getQueueTypes(); 

  queueList.innerHTML = queues.map((queue: QueueType) => {
    const status = queue.isActive ? "Aktif" : "Nonaktif";
    const toggleText = queue.isActive ? "Nonaktifkan" : "Aktifkan";

    return `
      <article>
        <h3>${escapeHTML(queue.name)} (${escapeHTML(queue.code)})</h3>
        <p>Status: ${status}</p>

        <button
          type="button"
          data-action="toggle"
          data-code="${escapeHTML(queue.code)}">
          ${toggleText}
        </button>

        <button
          type="button"
          data-action="delete"
          data-code="${escapeHTML(queue.code)}">
          Hapus
        </button>
      </article>
    `;
  }).join("") || "<p>Belum ada jenis antrian.</p>";

  // Hanya jenis antrian aktif yang dapat dipilih
  const activeQueues = queues.filter((queue: QueueType) => queue.isActive);

  ticketQueue.innerHTML = activeQueues.map((queue: QueueType) => {
    return `
      <option value="${escapeHTML(queue.code)}">
        ${escapeHTML(queue.name)} (${escapeHTML(queue.code)})
      </option>
    `;
  }).join("");

  ticketQueue.disabled = activeQueues.length === 0;
  issueButton.disabled = activeQueues.length === 0;

  renderTickets();
}

// Menampilkan tiket berdasarkan jenis antrian
function renderTickets(): void {
  // Ditambahkan tipe eksplisit QueueType[] dan Ticket[]
  const queues: QueueType[] = getQueueTypes();
  const tickets: Ticket[] = getTickets();

  ticketList.innerHTML = queues.map((queue: QueueType) => {
    const queueTickets = tickets
      .filter((ticket: Ticket) => ticket.typeCode === queue.code)
      .sort((a: Ticket, b: Ticket) => b.timestamp - a.timestamp);

    const ticketHTML = queueTickets.map((ticket: Ticket) => {
      return `
        <p>
          <strong>${escapeHTML(ticket.ticketNumber)}</strong>
          — ${escapeHTML(ticket.priority)}
          — ${escapeHTML(ticket.status)}
        </p>
      `;
    }).join("");

    return `
      <article>
        <h3>${escapeHTML(queue.name)} (${escapeHTML(queue.code)})</h3>
        ${ticketHTML || "<p>Belum ada tiket.</p>"}
      </article>
    `;
  }).join("") || "<p>Belum ada jenis antrian.</p>";
}

// Proteksi halaman Dashboard Admin
const token = localStorage.getItem("token");
const role = localStorage.getItem("role")?.toLowerCase();

if (!token || (role !== "admin" && role !== "moderator")) {
  window.location.replace("login.html");
} else {
  const firstName = localStorage.getItem("firstName") || "Admin";
  userInfo.textContent = `Pengguna: ${firstName} | Role: ${role}`;
  renderQueues();
}

// Menambah jenis antrian
queueForm.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();

  const formData = new FormData(queueForm);
  const code = String(formData.get("code") || "");
  const name = String(formData.get("name") || "");

  try {
    addQueueType(code, name);

    queueForm.reset();
    showMessage("Jenis antrian berhasil ditambahkan.");
    renderQueues();
  } catch (error) {
    showMessage(
      error instanceof Error
        ? error.message
        : "Gagal menambahkan jenis antrian."
    );
  }
});

// Mengaktifkan, menonaktifkan, dan menghapus jenis antrian
queueList.addEventListener("click", (event: MouseEvent) => {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const button = target.closest<HTMLButtonElement>("button[data-action]");
  if (!button) return;

  const code = button.dataset.code;
  const action = button.dataset.action;

  if (!code) return;

  try {
    if (action === "toggle") {
      toggleQueueType(code);
      showMessage("Status jenis antrian berhasil diubah.");
    } else if (action === "delete") {
      const confirmed = window.confirm("Yakin ingin menghapus jenis antrian ini?");
      if (!confirmed) return;

      deleteQueueType(code);
      showMessage("Jenis antrian berhasil dihapus.");
    }

    renderQueues();
  } catch (error) {
    showMessage(
      error instanceof Error
        ? error.message
        : "Operasi gagal."
    );
  }
});

// Menerbitkan tiket manual
ticketForm.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();

  const formData = new FormData(ticketForm);
  const code = String(formData.get("code") || "");
  const priority = String(formData.get("priority") || "Normal") as Priority;

  try {
    const ticket = generateTicket(code, priority);

    ticketResult.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Tiket berhasil diterbitkan";

    const number = document.createElement("p");
    number.textContent = ticket.ticketNumber;

    // Ditambahkan tipe eksplisit pada find
    const queue = getQueueTypes().find((q: QueueType) => q.code === ticket.typeCode);
    const queueName = queue ? queue.name : ticket.typeCode;

    const details = document.createElement("p");
    details.textContent = `${queueName} — ${ticket.priority} — ${ticket.status}`;

    ticketResult.append(heading, number, details);

    showMessage("Tiket manual berhasil diterbitkan.");
    renderQueues();
    window.dispatchEvent(new Event("storage"));
  } catch (error) {
    showMessage(
      error instanceof Error
        ? error.message
        : "Gagal menerbitkan tiket."
    );
  }
});

// Reset seluruh tiket
document.querySelector("#resetButton")?.addEventListener("click", () => {
  const confirmed = window.confirm("Reset seluruh tiket antrian? Data tiket akan dihapus.");
  if (!confirmed) return;

  try {
    resetTickets();
    ticketResult.replaceChildren();

    showMessage("Seluruh tiket berhasil direset.");
    renderQueues();
    window.dispatchEvent(new Event("storage"));
  } catch {
    showMessage("Gagal melakukan reset antrian.");
  }
});

// Logout
document.querySelector("#logoutButton")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("firstName");

  window.location.href = "login.html";
});

// Memperbarui tampilan saat Local Storage berubah di tab lain
window.addEventListener("storage", () => {
  renderQueues();
});

// Memperbarui daftar tiket secara berkala
window.setInterval(() => {
  renderQueues();
}, 2000);
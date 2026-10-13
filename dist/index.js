import { getQueueTypes, addQueueType, toggleQueueType, deleteQueueType } from "./queryTypes.js";
import { createTicket, getTickets, resetTickets } from "./tickets.js";
const queueForm = document.querySelector("#queueForm");
const ticketForm = document.querySelector("#ticketForm");
const queueList = document.querySelector("#queueList");
const ticketList = document.querySelector("#ticketList");
const ticketQueue = document.querySelector("#ticketQueue");
const ticketResult = document.querySelector("#ticketResult");
const message = document.querySelector("#message");
const issueButton = document.querySelector("#issueButton");
const userInfo = document.querySelector("#userInfo");
function escapeHTML(value) {
    return value.replace(/[&<>"']/g, (char) => {
        const entities = {
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        };
        return entities[char];
    });
}
function showMessage(text) {
    message.hidden = false;
    message.textContent = text;
}
function renderQueues() {
    const queues = getQueueTypes();
    queueList.innerHTML = queues.map((queue) => {
        const status = queue.active ? "Aktif" : "Nonaktif";
        const toggleText = queue.active ? "Nonaktifkan" : "Aktifkan";
        return `
      <article>
        <h3>${escapeHTML(queue.name)} (${escapeHTML(queue.code)})</h3>
        <p>Status: ${status}</p>
        <button type="button" data-action="toggle" data-code="${escapeHTML(queue.code)}">
          ${toggleText}
        </button>
        <button type="button" data-action="delete" data-code="${escapeHTML(queue.code)}">
          Hapus
        </button>
      </article>
    `;
    }).join("") || "<p>Belum ada jenis antrian.</p>";
    const activeQueues = queues.filter((queue) => queue.active);
    ticketQueue.innerHTML = activeQueues.map((queue) => {
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
function renderTickets() {
    const queues = getQueueTypes();
    const tickets = getTickets();
    ticketList.innerHTML = queues.map((queue) => {
        const queueTickets = tickets
            .filter((ticket) => ticket.typeCode === queue.code)
            .sort((a, b) => b.timestamp - a.timestamp);
        const ticketHTML = queueTickets.map((ticket) => {
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
const token = localStorage.getItem("token");
const role = localStorage.getItem("role")?.toLowerCase();
if (!token || (role !== "admin" && role !== "moderator")) {
    window.location.replace("login.html");
}
else {
    const firstName = localStorage.getItem("firstName") || "Admin";
    userInfo.textContent = `Pengguna: ${firstName} | Role: ${role}`;
    renderQueues();
}
queueForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(queueForm);
    const code = String(formData.get("code") || "");
    const name = String(formData.get("name") || "");
    try {
        addQueueType(code, name);
        queueForm.reset();
        showMessage("Jenis antrian berhasil ditambahkan.");
        renderQueues();
    }
    catch (error) {
        showMessage(error instanceof Error ? error.message : "Gagal menambahkan jenis antrian.");
    }
});
queueList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element))
        return;
    const button = target.closest("button[data-action]");
    if (!button)
        return;
    const code = button.dataset.code;
    const action = button.dataset.action;
    if (!code)
        return;
    try {
        if (action === "toggle") {
            toggleQueueType(code);
            showMessage("Status jenis antrian berhasil diubah.");
        }
        else if (action === "delete") {
            const confirmed = window.confirm("Yakin ingin menghapus jenis antrian ini?");
            if (!confirmed)
                return;
            deleteQueueType(code);
            showMessage("Jenis antrian berhasil dihapus.");
        }
        renderQueues();
    }
    catch (error) {
        showMessage(error instanceof Error ? error.message : "Operasi gagal.");
    }
});
ticketForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(ticketForm);
    const code = String(formData.get("code") || "");
    const priority = String(formData.get("priority") || "Normal");
    try {
        const ticket = createTicket(code, priority);
        ticketResult.replaceChildren();
        const heading = document.createElement("h3");
        heading.textContent = "Tiket berhasil diterbitkan";
        const number = document.createElement("p");
        number.textContent = ticket.ticketNumber;
        const queue = getQueueTypes().find((q) => q.code === ticket.typeCode);
        const queueName = queue ? queue.name : ticket.typeCode;
        const details = document.createElement("p");
        details.textContent = `${queueName} — ${ticket.priority} — ${ticket.status}`;
        ticketResult.append(heading, number, details);
        showMessage("Tiket manual berhasil diterbitkan.");
        renderQueues();
        window.dispatchEvent(new Event("storage"));
    }
    catch (error) {
        showMessage(error instanceof Error ? error.message : "Gagal menerbitkan tiket.");
    }
});
document.querySelector("#resetButton")?.addEventListener("click", () => {
    const confirmed = window.confirm("Reset seluruh tiket antrian? Data tiket akan dihapus.");
    if (!confirmed)
        return;
    try {
        resetTickets();
        ticketResult.replaceChildren();
        showMessage("Seluruh tiket berhasil direset.");
        renderQueues();
        window.dispatchEvent(new Event("storage"));
    }
    catch {
        showMessage("Gagal melakukan reset antrian.");
    }
});
document.querySelector("#logoutButton")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("firstName");
    window.location.href = "login.html";
});
window.addEventListener("storage", () => {
    renderQueues();
});
window.setInterval(() => {
    renderQueues();
}, 2000);

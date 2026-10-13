import { getTickets, callNext, skipCurrent, finishCurrent, getWaitingTickets } from './tickets.js';
import { getQueueTypes } from './queryTypes.js';
import { clearSession, guardPage, getSession } from "./auth.js";
// Hanya admin dan moderator yang boleh masuk
guardPage(["admin", "moderator"]);
// 1. Proteksi Halaman: Jika belum login, tendang ke halaman login
const session = getSession();
if (!session) {
    window.location.href = "login.html";
}
// 2. Fungsi Logout yang benar (menggunakan ID dari HTML)
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        clearSession();
        window.location.href = "login.html";
    });
}
// 3. Render Panel Operator
function renderOperatorPanel() {
    const container = document.getElementById('operator-container');
    if (!container)
        return;
    container.innerHTML = '';
    const queueTypes = getQueueTypes();
    const allTickets = getTickets();
    // Tampilkan pesan ini jika Admin belum menambahkan antrean
    if (queueTypes.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: #fff; border-radius: 8px;">
                <h3 style="color: #64748b;">Panel Kosong</h3>
                <p>Admin belum menambahkan jenis layanan antrean apa pun.</p>
            </div>
        `;
        return;
    }
    queueTypes.forEach((qt) => {
        const calledTicket = allTickets.find((t) => t.typeCode === qt.code && t.status === 'called');
        const waitingTickets = getWaitingTickets(qt.code);
        const nextTicket = waitingTickets.length > 0 ? waitingTickets[0] : null;
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
                <h3>${qt.name}</h3>
                <span style="font-size: 12px; color: gray;">${waitingTickets.length} menunggu</span>
            </div>
            
            <div class="status-row">
                <div>
                    <p style="font-size: 10px; color: gray; margin-bottom: 5px;">SEDANG DIPANGGIL</p>
                    <p class="ticket-number text-orange">${calledTicket ? calledTicket.ticketNumber : '-'}</p>
                </div>
                <div>
                    <p style="font-size: 10px; color: gray; margin-bottom: 5px;">BERIKUTNYA</p>
                    <p class="ticket-number">${nextTicket ? nextTicket.ticketNumber : '-'}</p>
                    ${nextTicket && nextTicket.priority !== 'Normal' ? `<span style="font-size:10px; color:red;">Prioritas ${nextTicket.priority}</span>` : ''}
                </div>
            </div>

            <div class="btn-group">
                <button class="btn-call" style="flex: 2" onclick="handleAction('${qt.code}', 'next')">Panggil Berikutnya</button>
                ${calledTicket ? `<button class="btn-outline" onclick="handleAction('${qt.code}', 'skip')">Lewati</button>` : ''}
                <button class="btn-outline" style="flex: 1" onclick="handleAction('${qt.code}', 'finish')">Selesai</button>
            </div>
            ${waitingTickets.length === 0 ? '<p style="font-size:12px; color:gray;">Tidak ada tiket menunggu untuk jenis antrean ini.</p>' : ''}
        `;
        container.appendChild(card);
    });
}
// 4. Mendaftarkan fungsi aksi ke Global Window agar bisa dibaca oleh inline onclick HTML
window.handleAction = (typeCode, action) => {
    if (action === 'next')
        callNext(typeCode);
    else if (action === 'skip')
        skipCurrent(typeCode);
    else if (action === 'finish')
        finishCurrent(typeCode);
    renderOperatorPanel();
    window.dispatchEvent(new Event('storage'));
};
renderOperatorPanel();
window.addEventListener('storage', renderOperatorPanel);

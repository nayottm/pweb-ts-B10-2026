import { getTickets, callNext, skipCurrent, finishCurrent, getWaitingTickets, QueueType } from './tickets.js';

if (!localStorage.getItem('session_token')) {
    window.location.href = 'login.html'; 
}

(window as any).logout = () => {
    localStorage.removeItem('session_token');
    localStorage.removeItem('session_role');
    window.location.href = 'login.html';
};

function renderOperatorPanel() {
    const container = document.getElementById('operator-container');
    if (!container) return;
    
    container.innerHTML = '';
    const queueData = localStorage.getItem('rs_queue_types');
    const queueTypes: QueueType[] = queueData ? JSON.parse(queueData) : [];
    const allTickets = getTickets();

    queueTypes.forEach(qt => {
        const calledTicket = allTickets.find(t => t.typeCode === qt.code && t.status === 'called');
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
            ${waitingTickets.length === 0 ? '<p style="font-size:12px; color:gray;">Tidak ada tiket menunggu untuk jenis antrian ini.</p>' : ''}
        `;
        container.appendChild(card);
    });
}

(window as any).handleAction = (typeCode: string, action: 'next' | 'skip' | 'finish') => {
    if (action === 'next') callNext(typeCode);
    else if (action === 'skip') skipCurrent(typeCode);
    else if (action === 'finish') finishCurrent(typeCode);
    
    renderOperatorPanel(); 
    window.dispatchEvent(new Event('storage')); 
};

renderOperatorPanel();
window.addEventListener('storage', renderOperatorPanel);
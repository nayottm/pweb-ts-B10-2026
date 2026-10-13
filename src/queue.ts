import { generateTicket } from './tickets.js';
import { getActiveQueueTypes } from './queryTypes.js';
import type { QueueType, Priority } from './types.js';

function renderQueueCards(): void {
    const container = document.getElementById('queue-container');
    if (!container) return;
    
    container.innerHTML = '';
    const queueTypes: QueueType[] = getActiveQueueTypes();

    queueTypes.forEach((qt: QueueType) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
                <h3>${qt.name}</h3>
                <span style="color: gray;">${qt.code}</span>
            </div>
            <button class="btn-main" onclick="takeTicket('${qt.code}', 'Normal')">Ambil Nomor</button>
            <p style="font-size: 12px; color: gray;">* Ambil dengan prioritas:</p>
            <div class="priority-btns">
                <button class="btn-sub" onclick="takeTicket('${qt.code}', 'Lansia')">Lansia</button>
                <button class="btn-sub" onclick="takeTicket('${qt.code}', 'Disabilitas')">Disabilitas</button>
                <button class="btn-sub" onclick="takeTicket('${qt.code}', 'VIP')">VIP</button>
            </div>
        `;
        container.appendChild(card);
    });
}

(window as any).takeTicket = (typeCode: string, priority: Priority) => {
    const newTicket = generateTicket(typeCode, priority);
    alert(`Tiket Anda berhasil dicetak!\nNomor: ${newTicket.ticketNumber}\nPrioritas: ${newTicket.priority}`);
    window.dispatchEvent(new Event('storage')); 
};

renderQueueCards();
window.addEventListener('storage', renderQueueCards);
setInterval(renderQueueCards, 3000);
const TICKETS_KEY = 'rs_tickets';
export function getTickets() {
    const data = localStorage.getItem(TICKETS_KEY);
    return data ? JSON.parse(data) : [];
}
export function saveTickets(tickets) {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}
export function generateTicket(typeCode, priority) {
    const tickets = getTickets();
    const typeTickets = tickets.filter(t => t.typeCode === typeCode);
    let nextNum = 1;
    if (typeTickets.length > 0) {
        const lastTicket = typeTickets[typeTickets.length - 1];
        const lastNumPart = lastTicket.ticketNumber.split('-')[1];
        nextNum = parseInt(lastNumPart) + 1;
    }
    const ticketNumber = `${typeCode}-${nextNum.toString().padStart(3, '0')}`;
    const newTicket = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        typeCode,
        ticketNumber,
        priority,
        status: 'waiting',
        timestamp: Date.now()
    };
    tickets.push(newTicket);
    saveTickets(tickets);
    return newTicket;
}
export function getWaitingTickets(typeCode) {
    const tickets = getTickets().filter(t => t.typeCode === typeCode && t.status === 'waiting');
    const priorityWeight = {
        'VIP': 1, 'Disabilitas': 2, 'Lansia': 3, 'Normal': 4
    };
    return tickets.sort((a, b) => {
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
            return priorityWeight[a.priority] - priorityWeight[b.priority];
        }
        return a.timestamp - b.timestamp;
    });
}
export function callNext(typeCode) {
    const tickets = getTickets();
    const currentTicket = tickets.find(t => t.typeCode === typeCode && t.status === 'called');
    if (currentTicket)
        currentTicket.status = 'done';
    const waitingTickets = getWaitingTickets(typeCode);
    if (waitingTickets.length > 0) {
        const nextTicketId = waitingTickets[0].id;
        const nextToCall = tickets.find(t => t.id === nextTicketId);
        if (nextToCall)
            nextToCall.status = 'called';
    }
    saveTickets(tickets);
}
export function skipCurrent(typeCode) {
    const tickets = getTickets();
    const currentTicket = tickets.find(t => t.typeCode === typeCode && t.status === 'called');
    if (currentTicket)
        currentTicket.status = 'skipped';
    saveTickets(tickets);
}
export function finishCurrent(typeCode) {
    const tickets = getTickets();
    const currentTicket = tickets.find(t => t.typeCode === typeCode && t.status === 'called');
    if (currentTicket)
        currentTicket.status = 'done';
    saveTickets(tickets);
}
export function resetTickets() {
    localStorage.removeItem(TICKETS_KEY);
}
// Alias agar kompatibel dengan kode index.ts milik temanmu
export const createTicket = generateTicket;

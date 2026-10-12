// --- Asumsi interface dari types.ts (Orang 2) ---
export interface QueueType {
    code: string;
    name: string;
    isActive: boolean;
}

export type Priority = 'Normal' | 'Lansia' | 'Disabilitas' | 'VIP';
export type TicketStatus = 'waiting' | 'called' | 'skipped' | 'done';

export interface Ticket {
    id: string;
    typeCode: string;
    ticketNumber: string;
    priority: Priority;
    status: TicketStatus;
    timestamp: number;
}
// ------------------------------------------------

const TICKETS_KEY = 'rs_tickets';

export function getTickets(): Ticket[] {
    const data = localStorage.getItem(TICKETS_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveTickets(tickets: Ticket[]): void {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

export function generateTicket(typeCode: string, priority: Priority): Ticket {
    const tickets = getTickets();
    const typeTickets = tickets.filter(t => t.typeCode === typeCode);
    
    let nextNum = 1;
    if (typeTickets.length > 0) {
        const lastTicket = typeTickets[typeTickets.length - 1];
        const lastNumPart = lastTicket.ticketNumber.split('-')[1];
        nextNum = parseInt(lastNumPart) + 1;
    }

    const ticketNumber = `${typeCode}-${nextNum.toString().padStart(3, '0')}`;
    
    const newTicket: Ticket = {
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

export function getWaitingTickets(typeCode: string): Ticket[] {
    const tickets = getTickets().filter(t => t.typeCode === typeCode && t.status === 'waiting');
    
    const priorityWeight: Record<Priority, number> = {
        'VIP': 1,
        'Disabilitas': 2,
        'Lansia': 3,
        'Normal': 4
    };

    return tickets.sort((a, b) => {
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
            return priorityWeight[a.priority] - priorityWeight[b.priority];
        }
        return a.timestamp - b.timestamp;
    });
}

export function callNext(typeCode: string): void {
    const tickets = getTickets();
    
    const currentTicket = tickets.find(t => t.typeCode === typeCode && t.status === 'called');
    if (currentTicket) currentTicket.status = 'done';

    const waitingTickets = getWaitingTickets(typeCode);
    if (waitingTickets.length > 0) {
        const nextTicketId = waitingTickets[0].id;
        const nextToCall = tickets.find(t => t.id === nextTicketId);
        if (nextToCall) nextToCall.status = 'called';
    }

    saveTickets(tickets);
}

export function skipCurrent(typeCode: string): void {
    const tickets = getTickets();
    const currentTicket = tickets.find(t => t.typeCode === typeCode && t.status === 'called');
    
    if (currentTicket) {
        currentTicket.status = 'skipped';
    }
    saveTickets(tickets);
}

export function finishCurrent(typeCode: string): void {
    const tickets = getTickets();
    const currentTicket = tickets.find(t => t.typeCode === typeCode && t.status === 'called');
    if (currentTicket) {
        currentTicket.status = 'done';
    }
    saveTickets(tickets);
}
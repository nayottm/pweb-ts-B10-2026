export interface QueueType {
    id: string;
    code: string;
    name: string;
    active: boolean;
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

export const KEYS = {
    TOKEN: "token",
    ROLE: "role",
    FIRST_NAME: "firstName",
    QUEUE_TYPES: "queueTypes",
    TICKETS: "rs_tickets",
    SESSION: "session"
};
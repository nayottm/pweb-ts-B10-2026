export type Priority = "Normal" | "Lansia" | "Disabilitas" | "VIP";
export type TicketStatus = "Menunggu" | "Dipanggil" | "Selesai" | "Dilewati";

export interface QueueType {
  id: string;
  code: string;   // 1 huruf kapital, contoh "A"
  name: string;   // contoh "UMUM-1"
  active: boolean;
}

export interface Ticket {
  id: string;
  queueTypeId: string;
  number: string;  // contoh "A-001"
  priority: Priority;
  status: TicketStatus;
  createdAt: number;
}

// Key Local Storage (dipakai semua anggota, jangan diubah sepihak)
export const KEYS = {
  session: "session",
  queueTypes: "queueTypes",
  tickets: "tickets",
  ticketCounters: "ticketCounters",
} as const;
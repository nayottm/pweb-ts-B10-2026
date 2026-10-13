import type { QueueType } from "./types.js";

const STORAGE_KEY = "queueTypes";

export function getQueueTypes(): QueueType[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed: unknown = JSON.parse(data);
    return Array.isArray(parsed) ? (parsed as QueueType[]) : [];
  } catch {
    return [];
  }
}

function saveQueueTypes(queues: QueueType[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queues));
}

export function addQueueType(code: string, name: string): QueueType {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedName = name.trim();

  if (!/^[A-Z]$/.test(normalizedCode)) {
    throw new Error("Kode harus satu huruf kapital.");
  }
  if (!normalizedName) {
    throw new Error("Nama layanan wajib diisi.");
  }

  const queues = getQueueTypes();
  const duplicate = queues.some(queue =>
    queue.code.toUpperCase() === normalizedCode ||
    queue.name.trim().toLowerCase() === normalizedName.toLowerCase()
  );

  if (duplicate) {
    throw new Error("Kode atau nama layanan sudah digunakan.");
  }

  const newQueue: QueueType = {
    id: Date.now().toString(),
    code: normalizedCode,
    name: normalizedName,
    active: true
  };

  queues.push(newQueue);
  saveQueueTypes(queues);
  return newQueue;
}

export function toggleQueueType(code: string): void {
  const queues = getQueueTypes();
  const queue = queues.find(item => item.code === code);
  if (!queue) throw new Error("Jenis antrian tidak ditemukan.");
  
  queue.active = !queue.active;
  saveQueueTypes(queues);
}

export function deleteQueueType(code: string): void {
  const queues = getQueueTypes();
  const updated = queues.filter(item => item.code !== code);
  if (updated.length === queues.length) {
    throw new Error("Jenis antrian tidak ditemukan.");
  }
  saveQueueTypes(updated);
}

export function getActiveQueueTypes(): QueueType[] {
  return getQueueTypes().filter(queue => queue.active);
}
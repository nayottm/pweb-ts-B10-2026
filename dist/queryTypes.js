"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueueTypes = getQueueTypes;
exports.addQueueType = addQueueType;
exports.toggleQueueType = toggleQueueType;
exports.deleteQueueType = deleteQueueType;
exports.getActiveQueueTypes = getActiveQueueTypes;
const STORAGE_KEY = "queueTypes";
function getQueueTypes() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data)
            return [];
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function saveQueueTypes(queues) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queues));
}
function addQueueType(code, name) {
    const normalizedCode = code.trim().toUpperCase();
    const normalizedName = name.trim();
    if (!/^[A-Z]$/.test(normalizedCode)) {
        throw new Error("Kode harus satu huruf kapital.");
    }
    if (!normalizedName) {
        throw new Error("Nama layanan wajib diisi.");
    }
    const queues = getQueueTypes();
    const duplicate = queues.some(queue => queue.code.toUpperCase() === normalizedCode ||
        queue.name.trim().toLowerCase() === normalizedName.toLowerCase());
    if (duplicate) {
        throw new Error("Kode atau nama layanan sudah digunakan.");
    }
    const newQueue = {
        id: Date.now().toString(),
        code: normalizedCode,
        name: normalizedName,
        active: true
    };
    queues.push(newQueue);
    saveQueueTypes(queues);
    return newQueue;
}
function toggleQueueType(code) {
    const queues = getQueueTypes();
    const queue = queues.find(item => item.code === code);
    if (!queue)
        throw new Error("Jenis antrian tidak ditemukan.");
    queue.active = !queue.active;
    saveQueueTypes(queues);
}
function deleteQueueType(code) {
    const queues = getQueueTypes();
    const updated = queues.filter(item => item.code !== code);
    if (updated.length === queues.length) {
        throw new Error("Jenis antrian tidak ditemukan.");
    }
    saveQueueTypes(updated);
}
function getActiveQueueTypes() {
    return getQueueTypes().filter(queue => queue.active);
}

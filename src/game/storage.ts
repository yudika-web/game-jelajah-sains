import { parseProgress, type Progress } from './mission';

const open = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open('jelajah-sains', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('saves');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
  request.onblocked = () => reject(new Error('Tutup tab permainan lama lalu coba lagi.'));
});
export async function loadProgress(): Promise<Progress | null> {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('saves').objectStore('saves').get('M01');
      request.onsuccess = () => { try { resolve(request.result ? parseProgress(request.result) : null); } catch (e) { reject(e); } };
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
export async function saveProgress(p: Progress): Promise<void> {
  const db = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('saves', 'readwrite');
      tx.objectStore('saves').put(p, 'M01');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}

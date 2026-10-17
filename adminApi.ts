import { increment, onValue, push, ref, remove, update } from 'firebase/database';
import type { InboxItem, InboxMessage } from '../types';
import { db, useDemoData } from './firebase';

const safeKey = (id: string) => id.replace(/[.#$[\]/]/g, '_');

/** Tambah hitungan penonton (dipakai untuk urutan popularitas). Sekali per sesi per konten. */
export function trackWatch(contentId: string): void {
  if (useDemoData) return;
  const key = safeKey(contentId);
  const flag = `nx.watched.${key}`;
  try {
    if (window.sessionStorage.getItem(flag)) return;
    window.sessionStorage.setItem(flag, '1');
  } catch {
    /* abaikan */
  }
  update(ref(db, 'globalWatch'), { [key]: increment(1) }).catch(() => undefined);
}

/** Simpan konten. `id` null = konten baru. Nilai null menghapus field (saat edit). */
export async function saveContent(id: string | null, data: Record<string, unknown>): Promise<string> {
  if (id) {
    await update(ref(db, `movies/${id}`), data);
    return id;
  }
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined));
  const r = await push(ref(db, 'movies'), { ...clean, uploadedAt: new Date().toLocaleString('id-ID') });
  return r.key ?? '';
}

export const deleteContent = (id: string) => remove(ref(db, `movies/${id}`));

// ---- Pengumuman ----
export const postAnnouncement = (title: string, body: string) =>
  push(ref(db, 'announcements'), { title, body, time: Date.now() });
export const deleteAnnouncement = (id: string) => remove(ref(db, `announcements/${id}`));

// ---- Inbox ----
type RawInbox = {
  name?: string;
  message?: string;
  type?: 'request' | 'lapor';
  time?: number | string;
  thread?: InboxMessage[] | Record<string, InboxMessage>;
  reply?: string;
  replyTime?: number | string;
};

const toTime = (t: number | string | undefined): number => (typeof t === 'number' ? t : t ? Date.parse(t) || 0 : 0);

export function mapInbox(id: string, v: RawInbox): InboxItem {
  const rawThread = Array.isArray(v.thread) ? v.thread : v.thread ? Object.values(v.thread) : [];
  const thread: InboxMessage[] = rawThread.map((m) => ({ ...m, time: toTime(m.time) }));
  if (thread.length === 0) {
    thread.push({ role: 'user', name: v.name, text: v.message ?? '', time: toTime(v.time) });
    if (v.reply) thread.push({ role: 'admin', text: v.reply, time: toTime(v.replyTime) });
  }
  return { id, name: v.name ?? 'Anonim', message: v.message ?? '', type: v.type === 'lapor' ? 'lapor' : 'request', time: toTime(v.time), thread };
}

/** Semua pesan (khusus admin; Rules harus mengizinkan baca inbox untuk admin). */
export function watchInbox(cb: (items: InboxItem[]) => void, onError: () => void): () => void {
  return onValue(
    ref(db, 'inbox'),
    (s) => {
      const v = (s.val() as Record<string, RawInbox> | null) ?? {};
      cb(Object.entries(v).map(([id, x]) => mapInbox(id, x)).sort((a, b) => b.time - a.time));
    },
    onError,
  );
}

/** Satu pesan milik pengguna (dibaca lewat ID acak yang disimpan di perangkatnya). */
export function watchMessage(id: string, cb: (item: InboxItem | null) => void): () => void {
  return onValue(
    ref(db, `inbox/${id}`),
    (s) => cb(s.exists() ? mapInbox(id, s.val() as RawInbox) : null),
    () => cb(null),
  );
}

export async function sendUserMessage(name: string, message: string, type: 'request' | 'lapor'): Promise<string> {
  const time = Date.now();
  const r = await push(ref(db, 'inbox'), {
    name,
    message,
    type,
    time,
    thread: [{ role: 'user', name, text: message, time }],
  });
  return r.key ?? '';
}

export async function adminReply(item: InboxItem, text: string): Promise<void> {
  const time = Date.now();
  const thread = [...item.thread, { role: 'admin', text, time }];
  await update(ref(db, `inbox/${item.id}`), { thread, reply: text, replyTime: time });
}

export const deleteInbox = (id: string) => remove(ref(db, `inbox/${id}`));

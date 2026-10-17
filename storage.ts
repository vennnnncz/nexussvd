// Penyimpanan lokal hanya untuk data non-sensitif (daftar favorit, progres, pencarian terakhir).
// Jangan simpan password atau token di sini.
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* penyimpanan penuh atau diblokir: abaikan */
  }
}

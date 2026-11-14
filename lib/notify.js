// Notifikasi error: kirim & baca catatan error lewat backend (/api/logs).
// Memakai fetch langsung (bukan api()) supaya kegagalan di sini tidak memicu notifikasi baru.
import { API_BASE, getToken } from "@/lib/api";

/**
 * @typedef {"backend" | "admin" | "user"} NotifySource
 *
 * @typedef {{
 *   id: string,
 *   source: NotifySource,
 *   message: string,
 *   path?: string | null,
 *   status?: number | null,
 *   createdAt: string,
 *   read: boolean,
 *   local?: boolean
 * }} NotifyItem
 * `local: true` = belum bisa dikirim ke server (mis. backend mati)
 */

/** @returns {Record<string, string>} */
const baseHeaders = () => {
  /** @type {Record<string, string>} */
  const h = { "ngrok-skip-browser-warning": "true" };
  const t = getToken();
  if (t) h["Authorization"] = `Bearer ${t}`;
  return h;
};

/**
 * Laporkan error dari admin ke backend. true = berhasil terkirim.
 * @param {{
 *   source: "admin",
 *   message: string,
 *   path?: string,
 *   status?: number,
 *   detail?: string
 * }} entry
 * @returns {Promise<boolean>}
 */
export async function sendLog(entry) {
  try {
    const res = await fetch(`${API_BASE}/logs`, {
      method: "POST",
      headers: { ...baseHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** @returns {Promise<{ unread: number, logs: NotifyItem[] } | null>} */
export async function fetchLogs() {
  try {
    const res = await fetch(`${API_BASE}/logs`, { headers: baseHeaders(), cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return { unread: data.unread, logs: data.logs.map((l) => ({ ...l, id: String(l.id) })) };
  } catch {
    return null;
  }
}

/**
 * @param {string} path
 * @param {"POST" | "DELETE"} method
 * @returns {Promise<boolean>}
 */
async function call(path, method) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { method, headers: baseHeaders() });
    return res.ok;
  } catch {
    return false;
  }
}

export const markAllRead = () => call("/logs/read", "POST");
export const clearLogs = () => call("/logs", "DELETE");
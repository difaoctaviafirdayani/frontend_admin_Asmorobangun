// Notifikasi error: kirim & baca catatan error lewat backend (/api/logs).
// Memakai fetch langsung (bukan api()) supaya kegagalan di sini tidak memicu notifikasi baru.
import { API_BASE, getToken } from "@/lib/api";

export type NotifySource = "backend" | "admin" | "user";

export interface NotifyItem {
  id: string;
  source: NotifySource;
  message: string;
  path?: string | null;
  status?: number | null;
  createdAt: string;
  read: boolean;
  local?: boolean; // true = belum bisa dikirim ke server (mis. backend mati)
}

interface LogsResponse {
  unread: number;
  logs: Array<Omit<NotifyItem, "id"> & { id: number }>;
}

const baseHeaders = (): Record<string, string> => {
  const h: Record<string, string> = { "ngrok-skip-browser-warning": "true" };
  const t = getToken();
  if (t) h["Authorization"] = `Bearer ${t}`;
  return h;
};

/** Laporkan error dari admin ke backend. true = berhasil terkirim. */
export async function sendLog(entry: {
  source: "admin";
  message: string;
  path?: string;
  status?: number;
  detail?: string;
}): Promise<boolean> {
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

export async function fetchLogs(): Promise<{ unread: number; logs: NotifyItem[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/logs`, { headers: baseHeaders(), cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as LogsResponse;
    return { unread: data.unread, logs: data.logs.map((l) => ({ ...l, id: String(l.id) })) };
  } catch {
    return null;
  }
}

async function call(path: string, method: "POST" | "DELETE"): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { method, headers: baseHeaders() });
    return res.ok;
  } catch {
    return false;
  }
}

export const markAllRead = () => call("/logs/read", "POST");
export const clearLogs = () => call("/logs", "DELETE");
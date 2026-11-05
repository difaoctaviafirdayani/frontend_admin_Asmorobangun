"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { setApiErrorHook } from "@/lib/api";
import { clearLogs, fetchLogs, markAllRead, sendLog, NotifyItem, NotifySource } from "@/lib/notify";

const POLL_MS = 15000;

const SOURCE_LABEL: Record<NotifySource, string> = {
  backend: "Backend",
  admin: "Admin",
  user: "User",
};

function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

/** Lonceng di pojok kanan atas navbar: menampilkan error dari backend, admin, dan aplikasi user. */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [server, setServer] = useState<NotifyItem[]>([]);
  const [local, setLocal] = useState<NotifyItem[]>([]);
  const [unread, setUnread] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const data = await fetchLogs();
    if (!data) return;
    setServer(data.logs);
    setUnread(data.unread);
  }, []);

  const addLocal = useCallback((message: string, status: number, path: string) => {
    const item: NotifyItem = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      source: "admin",
      message,
      status,
      path,
      createdAt: new Date().toISOString(),
      read: false,
      local: true,
    };
    setLocal((old) => [item, ...old].slice(0, 20));
  }, []);

  // Tangkap kegagalan API dari seluruh halaman admin.
  useEffect(() => {
    setApiErrorHook(({ message, status, path }) => {
      if (status === 0) return addLocal(message, status, path); // backend tak terjangkau
      if (status >= 500) return void refresh(); // backend sudah mencatat sendiri
      void sendLog({ source: "admin", message, path, status }).then((ok) =>
        ok ? refresh() : addLocal(message, status, path)
      );
    });
    return () => setApiErrorHook(null);
  }, [addLocal, refresh]);

  // Tangkap error JavaScript di halaman admin.
  useEffect(() => {
    const report = (message: string) => {
      if (!message || message.includes("ResizeObserver")) return;
      void sendLog({ source: "admin", message, path: location.pathname }).then((ok) =>
        ok ? refresh() : addLocal(message, 0, location.pathname)
      );
    };
    const onError = (e: ErrorEvent) => report(e.message);
    const onRejection = (e: PromiseRejectionEvent) =>
      report(e.reason instanceof Error ? e.reason.message : String(e.reason));
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [addLocal, refresh]);

  // Ambil daftar tiap 15 detik.
  useEffect(() => {
    void refresh();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  // Tutup panel: klik di luar atau tombol Esc.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function readAll() {
    await markAllRead();
    setLocal([]);
    await refresh();
  }

  async function clearAll() {
    await clearLogs();
    setLocal([]);
    await refresh();
  }

  const items = [...local, ...server];
  const badge = unread + local.length;

  return (
    <div className="a-bell" ref={boxRef}>
      <button
        type="button"
        className="a-bell-btn"
        aria-label={`Notifikasi, ${badge} belum dibaca`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {badge > 0 && <span className="a-bell-badge">{badge > 99 ? "99+" : badge}</span>}
      </button>

      {open && (
        <div className="a-bell-panel" role="dialog" aria-label="Notifikasi error">
          <div className="a-bell-head">
            <strong>Notifikasi</strong>
            <div className="a-bell-tools">
              <button type="button" onClick={readAll}>Tandai dibaca</button>
              <button type="button" onClick={clearAll}>Hapus semua</button>
            </div>
          </div>
          <div className="a-bell-list">
            {items.length === 0 ? (
              <div className="a-bell-empty">Tidak ada error. Semuanya aman.</div>
            ) : (
              items.map((it) => (
                <div key={it.id} className={`a-bell-item${it.read && !it.local ? "" : " unread"}`}>
                  <span className={`a-bell-tag ${it.source}`}>{SOURCE_LABEL[it.source]}</span>
                  <div className="a-bell-msg">{it.message}</div>
                  <div className="a-bell-meta">
                    {it.path ? `${it.path} · ` : ""}
                    {it.status ? `${it.status} · ` : ""}
                    {timeAgo(it.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
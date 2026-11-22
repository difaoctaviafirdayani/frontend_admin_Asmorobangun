"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { setApiErrorHook } from "@/lib/api";
import { clearLogs, fetchLogs, markAllRead, sendLog } from "@/lib/notify";
import { groupLogs } from "@/lib/notifikasi";

const POLL_MS = 15000;

const LEVEL = {
  tinggi: { label: "Penting", bg: "#FBE9E9", fg: "#A84C4C" },
  sedang: { label: "Perhatian", bg: "#FFF3DC", fg: "#9A6A12" },
  rendah: { label: "Info", bg: "#EEEBE6", fg: "#7A6B5D" },
};

function timeAgo(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

/** Lonceng di pojok kanan atas navbar: menampilkan masalah dari server, admin, dan aplikasi user. */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [server, setServer] = useState([]);
  const [local, setLocal] = useState([]);
  const [unread, setUnread] = useState(0);
  const [openKey, setOpenKey] = useState(null); // notifikasi yang detail teknisnya dibuka
  const boxRef = useRef(null);

  const refresh = useCallback(async () => {
    const data = await fetchLogs();
    if (!data) return;
    setServer(data.logs);
    setUnread(data.unread);
  }, []);

  const addLocal = useCallback((message, status, path) => {
    const item = {
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
    const report = (message) => {
      if (!message || message.includes("ResizeObserver")) return;
      void sendLog({ source: "admin", message, path: location.pathname }).then((ok) =>
        ok ? refresh() : addLocal(message, 0, location.pathname)
      );
    };
    const onError = (e) => report(e.message);
    const onRejection = (e) =>
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
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
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

  const groups = groupLogs([...local, ...server]);
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
        <div className="a-bell-panel" role="dialog" aria-label="Notifikasi masalah sistem">
          <div className="a-bell-head">
            <strong>Notifikasi</strong>
            <div className="a-bell-tools">
              <button type="button" onClick={readAll}>Tandai dibaca</button>
              <button type="button" onClick={clearAll}>Hapus semua</button>
            </div>
          </div>

          <div className="a-bell-list">
            {groups.length === 0 ? (
              <div className="a-bell-empty">Tidak ada masalah. Semuanya aman.</div>
            ) : (
              groups.map((g) => {
                const lv = LEVEL[g.level] || LEVEL.rendah;
                const isLocal = g.ids.some((id) => String(id).startsWith("local-"));
                const expanded = openKey === g.key;
                return (
                  <div key={g.key} className={`a-bell-item${g.unread ? " unread" : ""}`}>
                    {/* Tingkat + jumlah kejadian */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span
                        style={{
                          background: lv.bg,
                          color: lv.fg,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        {lv.label}
                      </span>
                      {g.count > 1 && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#7A6B5D" }}>×{g.count}</span>
                      )}
                    </div>

                    {/* Apa yang terjadi */}
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#3A2A1A", lineHeight: 1.35 }}>
                      {g.title}
                    </div>

                    {/* Saran tindakan */}
                    <div style={{ fontSize: 12.5, color: "#6B5A4A", lineHeight: 1.45, marginTop: 3 }}>
                      {g.hint}
                    </div>

                    {/* Di mana + kapan */}
                    <div style={{ fontSize: 11.5, color: "#9A8878", marginTop: 6 }}>
                      {g.area ? `${g.area} · ` : ""}
                      {g.sourceLabel} · {timeAgo(g.createdAt)}
                      {isLocal ? " · belum terkirim ke server" : ""}
                    </div>

                    {/* Detail teknis untuk developer */}
                    <button
                      type="button"
                      onClick={() => setOpenKey(expanded ? null : g.key)}
                      style={{
                        marginTop: 6,
                        padding: 0,
                        background: "none",
                        border: "none",
                        color: "#5A3E2B",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Detail teknis {expanded ? "▲" : "▼"}
                    </button>
                    {expanded && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: "8px 10px",
                          background: "#F6F0E8",
                          borderRadius: 6,
                          fontFamily: "ui-monospace, Menlo, Consolas, monospace",
                          fontSize: 11,
                          color: "#4A3A2A",
                          wordBreak: "break-word",
                        }}
                      >
                        {g.technical}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
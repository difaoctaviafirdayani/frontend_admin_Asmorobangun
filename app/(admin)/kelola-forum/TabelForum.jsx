"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

const TH = { padding: "16px 20px", fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px" };
const TD = { padding: "16px 20px", verticalAlign: "middle" };

export default function TabelForum({ rows, onChanged }) {
  const toast = useToast();
  const [menjawab, setMenjawab] = useState(null); // { thread, replies } yang sedang dijawab
  const [analisis, setAnalisis] = useState(null); // hasil analisis AI yang sedang dibuka
  const [loadingId, setLoadingId] = useState(null);
  const [loadingJawabId, setLoadingJawabId] = useState(null);
  const [menyimpan, setMenyimpan] = useState(false);

  // Buka hasil analisis satu diskusi. Kalau sudah pernah dianalisis, tampilkan hasil yang
  // tersimpan (status terbaru). AI baru dipanggil kalau belum ada hasil, atau paksa = true.
  async function analisisAI(row, paksa = false) {
    setLoadingId(row.id);
    try {
      if (!paksa) {
        const daftar = await api("/ai/results");
        const ada = (Array.isArray(daftar) ? daftar : []).find((r) => r.sourceId === row.id);
        if (ada) {
          setAnalisis({ ...ada, threadRow: row });
          return;
        }
      }
      const res = await api(`/ai/analyze/thread/${row.id}`, { method: "POST" });
      setAnalisis({ ...res, threadRow: row });
    } catch (err) {
      toast(err.message);
    } finally {
      setLoadingId(null);
    }
  }

  // admin menyetujui / menolak hasil AI
  async function verifikasi(status) {
    if (!analisis) return;
    setMenyimpan(true);
    try {
      const res = await api(`/ai/results/${analisis.id}/verify`, { method: "PATCH", body: { status } });
      setAnalisis({ ...res, threadRow: analisis.threadRow });
      toast(status === "approved" ? "Hasil analisis disetujui." : "Hasil analisis ditolak.");
    } catch (err) {
      toast(err.message);
    } finally {
      setMenyimpan(false);
    }
  }

  // ambil isi lengkap diskusi (dan balasannya) dulu, karena daftar hanya berisi ringkasan
  async function bukaJawab(row) {
    setLoadingJawabId(row.id);
    try {
      const res = await api(`/forum/${row.id}`);
      const thread = res.thread ?? res;
      const replies = res.replies ?? thread.replies ?? [];
      setMenjawab({ thread, replies });
    } catch (err) {
      toast(err.message);
    } finally {
      setLoadingJawabId(null);
    }
  }

  async function kirimJawaban(teks) {
    if (!menjawab) return;
    await api(`/forum/${menjawab.thread.id}/replies`, { method: "POST", body: { content: teks } });
    toast("Jawaban terkirim.");
    setMenjawab(null);
    onChanged();
  }

  return (
    <>
      <div
        style={{
          backgroundColor: "#FDFCEA",
          border: "1.5px solid #D4BBA5",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #D4BBA5", color: "#3A2A1A" }}>
                <th style={TH}>Topik</th>
                <th style={TH}>Kategori</th>
                <th style={TH}>Username</th>
                <th style={TH}>Tanggal</th>
                <th style={{ ...TH, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "24px 20px", color: "#7A6A5A", textAlign: "center" }}>
                    Belum ada diskusi.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #E6D8C3" }}>
                  <td style={TD}>
                    <strong style={{ color: "#3A2A1A" }}>{row.topic}</strong>
                  </td>
                  <td style={{ ...TD, color: "#7A6A5A" }}>{row.category}</td>
                  <td style={{ ...TD, color: "#5A4A3A" }}>{row.username}</td>
                  <td style={{ ...TD, color: "#5A4A3A", whiteSpace: "nowrap" }}>{row.date}</td>
                  <td style={{ ...TD, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => analisisAI(row)}
                        disabled={loadingId === row.id}
                        style={{
                          backgroundColor: "#5A7A4C",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: loadingId === row.id ? "wait" : "pointer",
                          opacity: loadingId === row.id ? 0.7 : 1,
                        }}
                      >
                        {loadingId === row.id ? "Menganalisis..." : "Analisis AI"}
                      </button>
                      <button
                        type="button"
                        onClick={() => bukaJawab(row)}
                        disabled={loadingJawabId === row.id}
                        style={{
                          backgroundColor: "#5A3E2B",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: loadingJawabId === row.id ? "wait" : "pointer",
                          opacity: loadingJawabId === row.id ? 0.7 : 1,
                        }}
                      >
                        {loadingJawabId === row.id ? "Membuka..." : "Jawab"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {analisis && (
        <HasilAnalisis
          hasil={analisis}
          menyimpan={menyimpan}
          onVerifikasi={verifikasi}
          onUlang={() => {
            const row = analisis.threadRow;
            setAnalisis(null);
            analisisAI(row, true);
          }}
          onClose={() => setAnalisis(null)}
        />
      )}

      {menjawab && (
        <FormJawab
          thread={menjawab.thread}
          replies={menjawab.replies}
          onSubmit={kirimJawaban}
          onClose={() => setMenjawab(null)}
        />
      )}
    </>
  );
}

function FormJawab({ thread, replies, onSubmit, onClose }) {
  const toast = useToast();
  const [teks, setTeks] = useState("");
  const [mengirim, setMengirim] = useState(false);

  // Tutup pakai Esc + kunci scroll halaman selama modal terbuka
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && !mengirim) onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, mengirim]);

  async function kirim() {
    if (!teks.trim()) {
      toast("Jawaban tidak boleh kosong.");
      return;
    }
    setMengirim(true);
    try {
      await onSubmit(teks.trim());
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal mengirim jawaban.");
    } finally {
      setMengirim(false);
    }
  }

  const labelStyle = { display: "block", fontSize: "14px", fontWeight: 500, color: "#3A2A1A", marginBottom: "8px" };
  const btnBase = {
    border: "none",
    padding: "11px 24px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: mengirim ? "not-allowed" : "pointer",
    fontFamily: "inherit",
  };

  return (
    <div
      onClick={() => !mengirim && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 9999,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "620px",
          maxHeight: "92vh",
          overflowY: "auto",
          color: "#3A2A1A",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "26px 28px 20px",
            borderBottom: "1px solid #F1E6DF",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 600, color: "#3A2A1A" }}>Jawab diskusi</h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#9A8272" }}>
              {thread.category} · {thread.userName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={mengirim}
            aria-label="Tutup"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#F1E6DF",
              color: "#5A3E2B",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Isi */}
        <div style={{ padding: "22px 28px 28px" }}>
          <label style={labelStyle}>Pertanyaan</label>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E6D8C3",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "20px",
            }}
          >
            <strong style={{ display: "block", marginBottom: "6px", color: "#3A2A1A" }}>{thread.title}</strong>
            <p style={{ margin: 0, lineHeight: 1.5, fontSize: "14px", color: "#5A4A3A", whiteSpace: "pre-wrap" }}>
              {thread.content}
            </p>
          </div>

          {replies.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Balasan sebelumnya</label>
              {replies.map((r, i) => (
                <div
                  key={r.id ?? i}
                  style={{
                    backgroundColor: "#FBF6F2",
                    border: "1px solid #F1E6DF",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    marginBottom: "8px",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  <strong>{r.userName ?? r.username ?? "Pengguna"}</strong>
                  {r.date ? (
                    <span style={{ color: "#9A8272", fontSize: "12px" }}> · {formatDate(r.date)}</span>
                  ) : null}
                  <div style={{ color: "#5A4A3A", whiteSpace: "pre-wrap" }}>{r.content ?? r.body}</div>
                </div>
              ))}
            </div>
          )}

          <label style={labelStyle}>Jawaban admin</label>
          <textarea
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            rows={5}
            placeholder="Tulis jawaban untuk diskusi ini..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #E6D8C3",
              backgroundColor: "#FFFFFF",
              color: "#3A2A1A",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              marginBottom: "22px",
            }}
          />

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={mengirim}
              style={{ ...btnBase, backgroundColor: "#F1E6DF", color: "#5A3E2B" }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={kirim}
              disabled={mengirim}
              style={{ ...btnBase, backgroundColor: "#764B37", color: "#FFFFFF", opacity: mengirim ? 0.7 : 1 }}
            >
              {mengirim ? "Mengirim..." : "Kirim jawaban"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_LABEL = {
  pending: "Menunggu verifikasi admin",
  approved: "Disetujui",
  rejected: "Ditolak",
  blocked: "Diblokir (terdeteksi prompt injection)",
};
const BARIS = [
  ["Sentimen", (o) => o.sentiment],
  ["Topik", (o) => String(o.topic).replace("_", " ")],
  ["Tingkat risiko", (o) => o.risk_level],
  ["Perlu dibalas admin", (o) => (o.needs_admin_reply ? "Ya" : "Tidak")],
  ["Keyakinan AI", (o) => `${Math.round(o.confidence * 100)}%`],
];

function HasilAnalisis({ hasil, menyimpan, onVerifikasi, onUlang, onClose }) {
  const o = hasil.output;
  const btn = { border: "none", padding: "8px 18px", borderRadius: "6px", fontSize: "14px", cursor: "pointer" };
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(58,42,26,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#FDFCEA",
          border: "1.5px solid #D4BBA5",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          color: "#3A2A1A",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "normal", marginBottom: "4px" }}>Analisis AI</h2>
        <p style={{ color: "#7A6A5A", fontSize: "13px", marginBottom: "16px" }}>
          {hasil.sourceTitle} · Status: <strong>{STATUS_LABEL[hasil.status] || hasil.status}</strong>
        </p>

        {o ? (
          <>
            <p style={{ marginBottom: "16px", lineHeight: 1.5 }}>
              <strong>Ringkasan:</strong> {o.summary}
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
              <tbody>
                {BARIS.map(([label, ambil]) => (
                  <tr key={label} style={{ borderBottom: "1px solid #E6D8C3" }}>
                    <td style={{ padding: "8px 0", color: "#7A6A5A", width: "45%" }}>{label}</td>
                    <td style={{ padding: "8px 0", textTransform: "capitalize" }}>{ambil(o)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ color: "#7A6A5A", fontSize: "12px", marginBottom: "16px" }}>
              Hasil ini dibuat AI dan bisa saja keliru. Periksa dulu sebelum disetujui.
            </p>
          </>
        ) : (
          <p style={{ marginBottom: "16px", lineHeight: 1.5 }}>
            Diskusi ini tidak dikirim ke AI.
            {hasil.blockedReason ? ` Alasan: ${hasil.blockedReason}` : ""}
          </p>
        )}

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
          {hasil.status === "pending" && (
            <>
              <button
                type="button"
                disabled={menyimpan}
                onClick={() => onVerifikasi("rejected")}
                style={{ ...btn, backgroundColor: "#A84C4C", color: "#FFFFFF" }}
              >
                Tolak
              </button>
              <button
                type="button"
                disabled={menyimpan}
                onClick={() => onVerifikasi("approved")}
                style={{ ...btn, backgroundColor: "#5A7A4C", color: "#FFFFFF" }}
              >
                Setujui
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onUlang}
            style={{ ...btn, backgroundColor: "#E6DCC9", color: "#3A2A1A", border: "1px solid #C4A482" }}
          >
            Analisis ulang
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ ...btn, backgroundColor: "#E6DCC9", color: "#3A2A1A", border: "1px solid #C4A482" }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
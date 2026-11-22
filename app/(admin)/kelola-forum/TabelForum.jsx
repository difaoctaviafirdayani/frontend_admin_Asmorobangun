"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";

const TH = { padding: "16px 20px", fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px" };
const TD = { padding: "16px 20px", verticalAlign: "middle" };

const FIELDS = [
  { name: "title", label: "Judul", required: true },
  {
    name: "category",
    label: "Kategori",
    type: "select",
    options: [
      { value: "Umum", label: "Umum" },
      { value: "Layanan", label: "Layanan" },
    ],
  },
  { name: "content", label: "Isi diskusi", type: "textarea", rows: 6, required: true },
];

export default function TabelForum({ rows, onChanged }) {
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [analisis, setAnalisis] = useState(null); // hasil analisis AI yang sedang dibuka
  const [loadingId, setLoadingId] = useState(null);
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

  // ambil isi lengkap diskusi dulu (daftar hanya berisi ringkasan)
  async function bukaEdit(row) {
    try {
      const res = await api(`/forum/${row.id}`);
      setEditing(res.thread);
    } catch (err) {
      toast(err.message);
    }
  }

  async function simpan(values) {
    if (!editing) return;
    await api(`/forum/${editing.id}`, { method: "PATCH", body: values });
    toast("Diskusi diperbarui.");
    setEditing(null);
    onChanged();
  }

  async function hapus(row) {
    if (!confirm(`Hapus diskusi "${row.topic}" beserta semua balasannya?`)) return;
    try {
      await api(`/forum/${row.id}`, { method: "DELETE" });
      toast("Diskusi dihapus.");
      onChanged();
    } catch (err) {
      toast(err.message);
    }
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
                        onClick={() => bukaEdit(row)}
                        style={{
                          backgroundColor: "#E6DCC9",
                          color: "#3A2A1A",
                          border: "1px solid #C4A482",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => hapus(row)}
                        style={{
                          backgroundColor: "#A84C4C",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                        }}
                      >
                        Hapus
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

      {editing && (
        <FormModal
          title="Moderasi diskusi"
          fields={FIELDS}
          initial={editing}
          onSubmit={simpan}
          onClose={() => setEditing(null)}
        />
      )}
    </>
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
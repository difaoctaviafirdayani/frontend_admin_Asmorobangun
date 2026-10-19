"use client";
import { useState } from "react";
import { formatDate, truncate } from "@/lib/format";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { useToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";
import type { FieldDef } from "@/components/CrudPage";

const FIELDS: FieldDef[] = [
  { name: "title", label: "Judul", required: true },
  { name: "category", label: "Kategori" },
  { name: "content", label: "Isi diskusi", type: "textarea", rows: 6, required: true },
];

interface ForumItem {
  id: string;
  topic: string;
  category: string;
  username: string;
  date: string;
}

export default function KelolaForumPage() {
    const toast = useToast();
  const { data, error, reload } = useLoad(() => api<{ threads: any[] }>("/forum"));
  const forumList: ForumItem[] = (data?.threads || []).map((t) => ({
    id: t.id,
    topic: t.title,
    category: t.category,
    username: t.userName,
    date: formatDate(t.date),
  }));
  const [editing, setEditing] = useState<Record<string, any> | null>(null);

  // ambil isi lengkap diskusi dulu (daftar hanya berisi ringkasan)
  async function bukaEdit(row: ForumItem) {
    try {
      const res = await api<{ thread: Record<string, any> }>(`/forum/${row.id}`);
      setEditing(res.thread);
    } catch (err: any) {
      toast(err.message);
    }
  }

  async function simpan(values: Record<string, any>) {
    if (!editing) return;
    await api(`/forum/${editing.id}`, { method: "PATCH", body: values });
    toast("Diskusi diperbarui.");
    setEditing(null);
    reload();
  }

  async function hapus(row: ForumItem) {
    if (!confirm(`Hapus diskusi "${row.topic}" beserta semua balasannya?`)) return;
    try {
      await api(`/forum/${row.id}`, { method: "DELETE" });
      toast("Diskusi dihapus.");
      reload();
    } catch (err: any) {
      toast(err.message);
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "100%", margin: "0 auto" }}>
      {/* Judul Halaman dengan Font Margarine */}
      <h1 
        style={{ 
          fontSize: "32px", 
          fontWeight: "normal", 
          color: "#3A2A1A", 
          marginBottom: "12px", 
          fontFamily: "'Margarine', cursive, sans-serif" 
        }}
      >
        Kelola Forum
      </h1>
            {editing && (
        <FormModal
          title="Moderasi diskusi"
          fields={FIELDS}
          initial={editing}
          onSubmit={simpan}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Dropdown Semua Kategori */}
      <div style={{ marginBottom: "20px" }}>
        <div 
          style={{ 
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#FAF6ED",
            border: "1.5px solid #D4BBA5",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "14px",
            color: "#3A2A1A",
            cursor: "pointer",
            width: "180px"
          }}
        >
          <span>Semua Kategori</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {/* Kotak Tabel dengan Warna FDFCEA Persis Figma */}
      <div 
        style={{ 
          backgroundColor: "#FDFCEA", 
          border: "1.5px solid #D4BBA5", 
          borderRadius: "12px", 
          overflow: "hidden" 
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #D4BBA5", color: "#3A2A1A" }}>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>TOPIK</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>KATEGORI</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>USERNAME</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>TANGGAL</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {forumList.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #E6D8C3" }}>
                  <td style={{ padding: "16px 20px", color: "#3A2A1A", verticalAlign: "middle", maxWidth: "250px" }}>
                    {truncate(row.topic, 50)}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" }}>{row.category}</td>
                  <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" }}>{row.username}</td>
                  <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" }}>{row.date}</td>
                  <td style={{ padding: "16px 20px", textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                      {/* Tombol Ikon Lingkaran (Edit) */}
                      <button 
                        type="button"
                        onClick={() => bukaEdit(row)}
                        title="Edit"
                        style={{ 
                          width: "32px", 
                          height: "32px", 
                          borderRadius: "50%", 
                          border: "1px solid #C4A482", 
                          background: "transparent", 
                          cursor: "pointer", 
                          display: "inline-flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          color: "#3A2A1A" 
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>

                      {/* Tombol Ikon Lingkaran (Hapus) */}
                      <button 
                        type="button"
                        onClick={() => hapus(row)}
                        title="Hapus"
                        style={{ 
                          width: "32px", 
                          height: "32px", 
                          borderRadius: "50%", 
                          border: "1px solid #C4A482", 
                          background: "transparent", 
                          cursor: "pointer", 
                          display: "inline-flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          color: "#3A2A1A" 
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
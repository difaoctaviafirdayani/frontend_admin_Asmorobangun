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
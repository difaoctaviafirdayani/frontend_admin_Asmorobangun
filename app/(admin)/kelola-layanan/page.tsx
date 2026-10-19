"use client";
import { useState } from "react";

import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { useToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";
import type { FieldDef } from "@/components/CrudPage";

const FIELDS: FieldDef[] = [
  { name: "name", label: "Nama layanan", required: true },
  { name: "priceInfo", label: "Harga", placeholder: "Contoh: Rp 15.000/kunjungan" },
  { name: "shortDesc", label: "Deskripsi singkat", type: "textarea", rows: 3 },
  { name: "longDesc", label: "Deskripsi lengkap", type: "textarea", rows: 6 },
  { name: "image", label: "Foto layanan", type: "image" },
];

interface LayananItem {
  id: string;
  name: string;
  price: string;
  description: string;
}

export default function KelolaLayananPage() {
    const toast = useToast();
  const { data, error, reload } = useLoad(() => api<{ facilities: any[] }>("/facilities"));
  // backend memakai priceInfo & shortDesc; tampilan memakai price & description
  const layananList: LayananItem[] = (data?.facilities || []).map((f) => ({
    ...f,
    price: f.priceInfo,
    description: f.shortDesc,
  }));
  const [editing, setEditing] = useState<LayananItem | null>(null);

  async function simpan(values: Record<string, any>) {
    if (!editing) return;
    await api(`/facilities/${editing.id}`, { method: "PATCH", body: values });
    toast("Layanan diperbarui.");
    setEditing(null);
    reload();
  }

  return (
    <div style={{ padding: "24px", maxWidth: "100%", margin: "0 auto" }}>
      {/* Judul Halaman dengan Font Margarine */}
      <h1 
        style={{ 
          fontSize: "32px", 
          fontWeight: "normal", 
          color: "#3A2A1A", 
          marginBottom: "24px", 
          fontFamily: "'Margarine', cursive, sans-serif" 
        }}
      >
        Kelola Layanan
      </h1>
            {editing && (
        <FormModal
          title="Edit layanan"
          fields={FIELDS}
          initial={editing}
          onSubmit={simpan}
          onClose={() => setEditing(null)}
        />
      )}

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
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>NAMA</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>HARGA</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>DESKRIPSI</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {layananList.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #E6D8C3" }}>
                  <td style={{ padding: "16px 20px", fontWeight: "600", color: "#3A2A1A", verticalAlign: "middle" }}>{row.name}</td>
                  <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" }}>{row.price}</td>
                  <td style={{ padding: "16px 20px", color: "#6A5A4A", maxWidth: "350px", verticalAlign: "middle", lineHeight: "1.5" }}>{row.description}</td>
                  <td style={{ padding: "16px 20px", textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                      {/* Tombol Ikon Lingkaran (Detail) */}
                      <button 
                        type="button"
                        title="Detail" 
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
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>

                      {/* Tombol Ikon Lingkaran (Edit) */}
                      <button 
                        type="button"
                        onClick={() => setEditing(row)}
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
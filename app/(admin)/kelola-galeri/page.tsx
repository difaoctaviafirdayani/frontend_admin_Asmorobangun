"use client";

import React, { useState } from "react";
import Image from "next/image";
import { api, assetUrl } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { useToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";
import type { FieldDef } from "@/components/CrudPage";

const FIELDS: FieldDef[] = [
  { name: "title", label: "Judul", required: true },
  { name: "caption", label: "Keterangan", type: "textarea", rows: 3 },
  { name: "image", label: "Foto", type: "image", required: true },
];

interface GaleriItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

export default function KelolaGaleriPage() {
    const toast = useToast();
  const { data, error, reload } = useLoad(() => api<{ gallery: any[] }>("/gallery"));
  // backend memakai field caption; tampilan memakai description
  const galeriList: GaleriItem[] = (data?.gallery || []).map((g) => ({ ...g, description: g.caption }));
  const [editing, setEditing] = useState<GaleriItem | "new" | null>(null);

  const handleTambahFoto = () => {
    setEditing("new");
  };

  const handleEdit = (id: string) => {
    setEditing(galeriList.find((item) => item.id === id) || null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus foto ini?")) return;
    try {
      await api(`/gallery/${id}`, { method: "DELETE" });
      toast("Foto dihapus.");
      reload();
    } catch (err: any) {
      toast(err.message);
    }
  };

  async function simpan(values: Record<string, any>) {
    if (editing === "new") {
      await api("/gallery", { method: "POST", body: values });
      toast("Foto ditambahkan.");
    } else if (editing) {
      await api(`/gallery/${editing.id}`, { method: "PATCH", body: values });
      toast("Foto diperbarui.");
    }
    setEditing(null);
    reload();
  }

  return (
    <div style={{ fontFamily: "var(--font-poppins), sans-serif", color: "#3A2A1A" }}>
      {/* Judul Halaman (Menggunakan Margarine sesuai standar halaman lain) */}
      <h1 
        style={{ 
          fontSize: "28px", 
          fontWeight: "bold", 
          marginBottom: "20px",
          fontFamily: "var(--font-margarine), cursive, sans-serif"
        }}
      >
        Kelola Galeri
      </h1>
            {error && <div style={{ color: "#A84C4C", marginBottom: "12px", fontSize: "14px" }}>{error}</div>}
      {/* Tombol Tambah Foto */}
      <button
        type="button"
        onClick={handleTambahFoto}
        style={{
          backgroundColor: "#5C3A21",
          color: "#FFFFFF",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "24px",
          fontFamily: "var(--font-poppins), sans-serif",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span> Tambah Foto
      </button>

      {/* Grid Kartu Galeri */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
          gap: "24px" 
        }}
      >
        {galeriList.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #8C6D53",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <div>
              {/* Gambar / Foto */}
              <div 
                style={{ 
                  position: "relative", 
                  width: "100%", 
                  height: "200px", 
                  borderRadius: "12px", 
                  overflow: "hidden",
                  marginBottom: "16px",
                  backgroundColor: "#EFE8DC" 
                }}
              >
                <Image
                  src={assetUrl(item.image) || "/images/tari-1.jpg"}
                  unoptimized
                  alt={item.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>

              {/* Judul Kartu (Menggunakan Font Poppins, Ketebalan Bold) */}
              <h3 
                style={{ 
                  fontSize: "18px", 
                  fontWeight: "bold", 
                  marginBottom: "8px",
                  fontFamily: "var(--font-poppins), sans-serif",
                  color: "#3A2A1A"
                }}
              >
                {item.title}
              </h3>

              {/* Keterangan (Menggunakan Font Poppins)[cite: 10] */}
              <p 
                style={{ 
                  fontSize: "13px", 
                  color: "#6B5B4F", 
                  marginBottom: "20px",
                  lineHeight: "1.4",
                  fontFamily: "var(--font-poppins), sans-serif"
                }}
              >
                {item.description}
              </p>
            </div>

            {/* Tombol Aksi (Edit & Hapus dengan Font Poppins)[cite: 10] */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => handleEdit(item.id)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #8C6D53",
                  backgroundColor: "#FFFFFF",
                  color: "#3A2A1A",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  textAlign: "center",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#FF6B6B",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  textAlign: "center",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
            {editing && (
        <FormModal
          title={editing === "new" ? "Tambah foto" : "Edit foto"}
          fields={FIELDS}
          initial={editing === "new" ? {} : (editing as any)}
          onSubmit={simpan}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
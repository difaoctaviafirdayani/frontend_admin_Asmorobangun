"use client";

import { useState } from "react";
import Image from "next/image";
import { api, assetUrl } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { getErrorMessage } from "@/lib/format";
import { toGaleriView } from "@/lib/galeri";
import { useToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";
import type { FieldDef, FormValues } from "@/types/crud";
import type { Galeri, GaleriApi } from "@/types/galeri";

const FIELDS: FieldDef[] = [
  { name: "title", label: "Judul", required: true },
  { name: "caption", label: "Keterangan", type: "textarea", rows: 3 },
  { name: "image", label: "Foto", type: "image", required: true },
];

export default function KelolaGaleriPage() {
  const toast = useToast();
  const { data, error, reload } = useLoad(() => api<{ gallery: GaleriApi[] }>("/gallery"));
  const galeriList: Galeri[] = (data?.gallery ?? []).map(toGaleriView);
  const [editing, setEditing] = useState<Galeri | "new" | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus foto ini?")) return;
    try {
      await api(`/gallery/${id}`, { method: "DELETE" });
      toast("Foto dihapus.");
      reload();
    } catch (err) {
      toast(getErrorMessage(err));
    }
  }

  async function simpan(values: FormValues) {
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
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "20px",
          fontFamily: "var(--font-margarine), cursive, sans-serif",
        }}
      >
        Kelola Galeri
      </h1>

      {error && <div style={{ color: "#A84C4C", marginBottom: "12px", fontSize: "14px" }}>{error}</div>}

      <button
        type="button"
        onClick={() => setEditing("new")}
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
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
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "200px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginBottom: "16px",
                  backgroundColor: "#EFE8DC",
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

              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  fontFamily: "var(--font-poppins), sans-serif",
                  color: "#3A2A1A",
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  fontSize: "13px",
                  color: "#6B5B4F",
                  marginBottom: "20px",
                  lineHeight: "1.4",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                {item.description}
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setEditing(item)}
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
          initial={editing === "new" ? {} : (editing as unknown as FormValues)}
          onSubmit={simpan}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
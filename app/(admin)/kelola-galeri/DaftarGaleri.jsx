"use client";

import Image from "next/image";
import { api, assetUrl } from "@/lib/api";
import { getErrorMessage } from "@/lib/format";
import { useToast } from "@/components/Toast";
import { useState } from "react";
import Lightbox from "@/components/LightBox";

export default function DaftarGaleri({ list, onEdit, onChanged }) {
  const toast = useToast();
  const [preview, setPreview] = useState(null); // { url, alt } atau null

  async function handleDelete(id) {
    if (!confirm("Hapus foto ini?")) return;
    try {
      await api(`/gallery/${id}`, { method: "DELETE" });
      toast("Foto dihapus.");
      onChanged();
    } catch (err) {
      toast(getErrorMessage(err));
    }
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        {list.map((item) => {
          const url = assetUrl(item.image) || "/images/tari-1.jpg";

          return (
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
                  onClick={() => setPreview({ url, alt: item.title })}
                  title="Klik untuk memperbesar"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "150px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    marginBottom: "16px",
                    backgroundColor: "#EFE8DC",
                    cursor: "pointer",
                  }}
                >
                  <Image
                    src={url}
                    unoptimized
                    alt={item.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 380px"
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
                  onClick={() => onEdit(item)}
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
          );
        })}
      </div>

      {preview && <Lightbox url={preview.url} alt={preview.alt} onClose={() => setPreview(null)} />}
    </>
  );
}
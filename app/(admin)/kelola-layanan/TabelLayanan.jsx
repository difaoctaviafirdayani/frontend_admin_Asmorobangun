"use client";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";
import { assetUrl } from "@/lib/api";

const TH = { padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" };

const ICON_BTN = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  border: "1px solid #C4A482",
  background: "transparent",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#3A2A1A",
};

const THUMB_EMPTY = {
  width: "50px",
  height: "50px",
  borderRadius: "10px",
  backgroundColor: "#E8DCCB",
  color: "#5A4A3A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
};

function Thumb({ src, alt, onPreview }) {
  const [gagalMuat, setGagalMuat] = useState(false);
  const url = assetUrl(src);

  if (!url || gagalMuat) return <div style={THUMB_EMPTY}>–</div>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      onError={() => setGagalMuat(true)}
      onClick={() => onPreview?.(url, alt)}
      title="Klik untuk memperbesar"
      style={{
        width: "50px",
        height: "50px",
        objectFit: "cover",
        borderRadius: "10px",
        border: "1px solid #D4BBA5",
        display: "block",
        cursor: "pointer",
      }}
    />
  );
}

function Lightbox({ url, alt, onClose }) {
  // Tutup pakai tombol Esc + kunci scroll halaman selama modal terbuka
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "24px",
        cursor: "default",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        style={{
          position: "absolute",
          top: "20px",
          right: "24px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#FDFCEA",
          color: "#3A2A1A",
          fontSize: "20px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "80vh",
          objectFit: "contain",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          cursor: "default",
        }}
      />
      <div style={{ marginTop: "14px", color: "#FDFCEA", fontSize: "16px", fontWeight: 600 }}>{alt}</div>
    </div>
  );
}

export default function TabelLayanan({ list, onEdit }) {
  const [preview, setPreview] = useState(null); // { url, alt } atau null

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
                <th style={TH}>GAMBAR</th>
                <th style={TH}>NAMA</th>
                <th style={TH}>HARGA</th>
                <th style={TH}>DESKRIPSI</th>
                <th style={{ ...TH, textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #E6D8C3" }}>
                  <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                    <Thumb src={row.image} alt={row.name} onPreview={(url, alt) => setPreview({ url, alt })} />
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: "600", color: "#3A2A1A", verticalAlign: "middle" }}>
                    {row.name}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" }}>
                    {row.price ? formatRupiah(row.price) : "-"}
                    {row.priceText ? ` (${row.priceText})` : ""}
                  </td>
                  <td
                    style={{
                      padding: "16px 20px",
                      color: "#6A5A4A",
                      maxWidth: "350px",
                      verticalAlign: "middle",
                      lineHeight: "1.5",
                    }}
                  >
                    {row.description}
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                      <button type="button" title="Detail" style={ICON_BTN}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>

                      <button type="button" onClick={() => onEdit(row)} title="Edit" style={ICON_BTN}>
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

      {preview && <Lightbox url={preview.url} alt={preview.alt} onClose={() => setPreview(null)} />}
    </>
  );
}
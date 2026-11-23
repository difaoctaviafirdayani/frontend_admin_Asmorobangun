"use client";
import { useEffect } from "react";

export default function Lightbox({ url, alt, onClose }) {
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
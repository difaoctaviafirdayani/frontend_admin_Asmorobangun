"use client";
import { ReactNode, useEffect } from "react";

interface Props {
  title?: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}

/** Popup di tengah layar dengan latar gelap, judul, tombol tutup (×), dan isi yang bisa di-scroll. */
export default function Modal({ title, onClose, wide, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // Halaman di belakang tidak ikut ter-scroll saat popup terbuka.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="a-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`a-modal${wide ? " wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="a-modal-header">
          <h2>{title}</h2>
          <button type="button" className="a-modal-close" aria-label="Tutup" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="a-modal-body">{children}</div>
      </div>
    </div>
  );
}
"use client";
import { ReactNode, useEffect } from "react";

interface Props {
  title?: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}

export default function Modal({ title, onClose, wide, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="a-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`a-modal${wide ? " wide" : ""}`} role="dialog" aria-modal="true">
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
}

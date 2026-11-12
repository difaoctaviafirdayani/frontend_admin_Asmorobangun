"use client";
import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  minWidth?: number;
}

/** Dropdown bertema coklat sebagai pengganti <select> bawaan browser (yang daftarnya biru & tidak bisa di-style). */
export default function CustomSelect({ value, options, onChange, ariaLabel, minWidth = 220 }: Props) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];

  // Tutup kalau klik di luar atau tekan Esc
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={rootRef} style={{ position: "relative", display: "inline-block", minWidth }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          backgroundColor: "#FFFFFF",
          color: "#3A2A1A",
          border: "1px solid #5A3E2B",
          borderRadius: "8px",
          padding: "10px 14px",
          fontSize: "14px",
          fontFamily: "inherit",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span>{selected?.label}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ flexShrink: 0, transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none" }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            minWidth: "100%",
            maxHeight: "280px",
            overflowY: "auto",
            margin: 0,
            padding: "6px",
            listStyle: "none",
            backgroundColor: "#FDFCEA",
            border: "1.5px solid #D4BBA5",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(58, 42, 26, 0.18)",
            zIndex: 50,
          }}
        >
          {options.map((o, i) => {
            const active = o.value === value;
            const hovered = hover === i;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={active}
                onClick={() => pick(o.value)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{
                  padding: "9px 12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  fontWeight: active ? 600 : 400,
                  color: active ? "#FFFFFF" : "#3A2A1A",
                  backgroundColor: active ? "#5A3E2B" : hovered ? "#EADCCB" : "transparent",
                }}
              >
                {o.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
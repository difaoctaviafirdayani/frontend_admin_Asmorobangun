"use client";
import { useEffect, useRef, useState } from "react";

export default function FilterForum({
  categories,
  fKategori,
  onKategoriChange,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Tutup dropdown kalau klik di luar atau tekan Esc
  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const options = [{ value: "", label: "Semua Kategori" }].concat(
    (categories || []).map((c) => ({ value: c, label: c }))
  );
  const current = options.find((o) => o.value === fKategori) || options[0];

  function pilih(value) {
    onKategoriChange(value);
    setOpen(false);
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <div ref={wrapRef} style={{ position: "relative", display: "inline-block", width: "220px" }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            backgroundColor: open ? "#FDFCEA" : "#FAF6ED",
            border: open ? "1.5px solid #5A3E2B" : "1.5px solid #D4BBA5",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "14px",
            color: "#3A2A1A",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <span>{current.label}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none" }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {open && (
          <div
            role="listbox"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 50,
              backgroundColor: "#FDFCEA",
              border: "1px solid #D4BBA5",
              borderRadius: "12px",
              padding: "8px",
              maxHeight: "280px",
              overflowY: "auto",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            }}
          >
            {options.map((o) => {
              const selected = o.value === fKategori;
              return (
                <div
                  key={o.value || "semua"}
                  role="option"
                  aria-selected={selected}
                  onClick={() => pilih(o.value)}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = "#F1E6DF";
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                    backgroundColor: selected ? "#5A3E2B" : "transparent",
                    color: selected ? "#FFFFFF" : "#3A2A1A",
                    fontWeight: selected ? 700 : 400,
                  }}
                >
                  {o.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
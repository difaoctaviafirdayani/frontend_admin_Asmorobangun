"use client";

export default function FilterForum({ categories, fKategori, onKategoriChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
      <label htmlFor="filter-kategori" style={{ fontSize: "14px", fontWeight: 600, color: "#3A2A1A" }}>
        Kategori
      </label>
      <select
        id="filter-kategori"
        value={fKategori}
        onChange={(e) => onKategoriChange(e.target.value)}
        style={{
          backgroundColor: "#FDFCEA",
          color: "#3A2A1A",
          border: "1.5px solid #D4BBA5",
          borderRadius: "8px",
          padding: "9px 14px",
          fontSize: "14px",
          cursor: "pointer",
          minWidth: "180px",
        }}
      >
        <option value="">Semua kategori</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {fKategori && (
        <button
          type="button"
          onClick={() => onKategoriChange("")}
          style={{
            backgroundColor: "#F1E6DF",
            color: "#5A3E2B",
            border: "none",
            padding: "9px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
}